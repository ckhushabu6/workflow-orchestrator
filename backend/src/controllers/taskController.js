import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TaskVersion from '../models/TaskVersion.js';
import { AUDIT_ACTIONS, writeAuditLog } from '../services/auditLogger.js';
import { assertAcyclicDependencies } from '../services/cycleDetector.js';
import {
  emitRetryAttempted,
  emitTaskCreated,
  emitTaskDeleted,
  emitTaskStatusChanged,
  emitTaskUpdated,
} from '../sockets/taskEvents.js';
import asyncHandler from '../utils/asyncHandler.js';

const taskPopulation = [
  { path: 'project', select: 'name owner members' },
  { path: 'dependencies', select: 'title status priority' },
  { path: 'createdBy', select: 'name email' },
];

const mutableTaskFields = [
  'title',
  'description',
  'priority',
  'estimatedHours',
  'status',
  'dependencies',
  'resourceTag',
  'maxRetries',
  'retryCount',
];

const isSameId = (left, right) => left?.toString() === right?.toString();

const isProjectMember = (project, userId) => {
  const isOwner = isSameId(project.owner, userId);
  const isMember = project.members.some((memberId) => isSameId(memberId, userId));

  return isOwner || isMember;
};

const getAuthorizedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  if (!isProjectMember(project, userId)) {
    res.status(403);
    throw new Error('You are not authorized to access tasks for this project.');
  }

  return project;
};

const getAuthorizedTask = async (taskId, userId, res) => {
  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  await getAuthorizedProject(task.project, userId, res);
  return task;
};

const ensureDependenciesBelongToProject = async (dependencies, projectId, res) => {
  if (!dependencies?.length) {
    return;
  }

  const dependencyCount = await Task.countDocuments({
    _id: { $in: dependencies },
    project: projectId,
  });

  if (dependencyCount !== dependencies.length) {
    res.status(400);
    throw new Error('All dependencies must belong to the same project.');
  }
};

const ensureTaskGraphHasNoCycles = async (
  { actor, projectId, taskId, dependencies },
  res,
) => {
  const projectTasks = await Task.find({ project: projectId }).select(
    '_id dependencies',
  );

  try {
    assertAcyclicDependencies(projectTasks, { taskId, dependencies });
  } catch (error) {
    await writeAuditLog({
      actor,
      action: AUDIT_ACTIONS.DEPENDENCY_REJECTED,
      entity: { type: 'Task', id: taskId },
      metadata: {
        projectId,
        dependencies,
        reason: error.message,
      },
    });
    res.status(400);
    throw error;
  }
};

const ensureTaskCanRun = async ({ task, nextPayload }, res) => {
 const nextStatus = nextPayload.status;

if (
  !['Running', 'Completed'].includes(nextStatus)
) {
  return;
}

  const dependencies = nextPayload.dependencies ?? task.dependencies;

  if (dependencies.length > 0) {
    const incompleteDependencies = await Task.find({
      _id: { $in: dependencies },
      status: { $ne: 'Completed' },
    }).select('title status');

    if (incompleteDependencies.length > 0) {
      res.status(400);
      throw new Error(
        `Task cannot move to ${nextStatus} until all dependencies are Completed. Incomplete dependencies: ${incompleteDependencies
          .map((dependency) => `${dependency.title} (${dependency.status})`)
          .join(', ')}.`,
      );
    }
  }

  const resourceTag = nextPayload.resourceTag ?? task.resourceTag;

  if (!resourceTag) {
    return;
  }

  const runningTaskWithSameResource = await Task.findOne({
    _id: { $ne: task._id },
    project: task.project,
    status: 'Running',
    resourceTag,
  }).select('title resourceTag');

  if (runningTaskWithSameResource) {
    res.status(400);
    throw new Error(
      `Task cannot move to Running because "${runningTaskWithSameResource.title}" is already Running with resourceTag "${resourceTag}".`,
    );
  }
};

const sanitizeTaskPayload = (body) => {
  return mutableTaskFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }

    return payload;
  }, {});
};

const getPopulatedTaskById = (taskId) => Task.findById(taskId).populate(taskPopulation);

const createTaskSnapshot = (task) => ({
  title: task.title,
  description: task.description,
  priority: task.priority,
  estimatedHours: task.estimatedHours,
  status: task.status,
  dependencies: task.dependencies,
  resourceTag: task.resourceTag,
  maxRetries: task.maxRetries,
  retryCount: task.retryCount,
  versionNumber: task.versionNumber,
});

const createTaskVersion = (task, userId) =>
  TaskVersion.create({
    task: task._id,
    project: task.project,
    versionNumber: task.versionNumber,
    snapshot: createTaskSnapshot(task),
    changedBy: userId,
  });

export const createTask = asyncHandler(async (req, res) => {
  const projectId = req.body.projectId || req.body.project;
  const task = new Task({
    ...sanitizeTaskPayload(req.body),
    project: projectId,
    createdBy: req.user._id,
  });

  await getAuthorizedProject(projectId, req.user._id, res);
  await ensureDependenciesBelongToProject(req.body.dependencies, projectId, res);
  await ensureTaskGraphHasNoCycles(
    {
      projectId,
      actor: req.user._id,
      taskId: task._id,
      dependencies: task.dependencies,
    },
    res,
  );

  await task.save();

  const populatedTask = await Task.findById(task._id).populate(taskPopulation);
  await writeAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.TASK_CREATED,
    entity: { type: 'Task', id: task._id },
    metadata: { projectId, title: task.title },
  });
  emitTaskCreated(populatedTask);

  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    task: populatedTask,
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await getAuthorizedTask(req.params.id, req.user._id, res);
  const requestedVersion = Number(req.body.versionNumber);
  const previousStatus = task.status;
  const previousRetryCount = task.retryCount;

  if (task.versionNumber !== requestedVersion) {
    const latestTask = await getPopulatedTaskById(task._id);

    res.status(409).json({
      success: false,
      message:
        'Task update conflict. The task has changed since this version was loaded.',
      latestTask,
    });
    return;
  }

  if (
    req.body.dependencies?.some((dependencyId) =>
      isSameId(dependencyId, task._id),
    )
  ) {
    res.status(400);
    throw new Error('A task cannot depend on itself.');
  }

  await ensureDependenciesBelongToProject(req.body.dependencies, task.project, res);
  await ensureTaskGraphHasNoCycles(
    {
      projectId: task.project,
      actor: req.user._id,
      taskId: task._id,
      dependencies: req.body.dependencies ?? task.dependencies,
    },
    res,
  );

  const nextPayload = sanitizeTaskPayload(req.body);

  await ensureTaskCanRun({ task, nextPayload }, res);
  await createTaskVersion(task, req.user._id);

  Object.assign(task, nextPayload);
  task.versionNumber += 1;
  await task.save();

  const populatedTask = await getPopulatedTaskById(task._id);
  await writeAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.TASK_UPDATED,
    entity: { type: 'Task', id: task._id },
    metadata: {
      projectId: task.project,
      previousStatus,
      status: populatedTask.status,
      versionNumber: populatedTask.versionNumber,
    },
  });
  emitTaskUpdated(populatedTask);

  if (previousStatus !== populatedTask.status) {
    emitTaskStatusChanged({ task: populatedTask, previousStatus });
  }

  if (previousStatus !== 'Failed' && populatedTask.status === 'Failed') {
    await writeAuditLog({
      actor: req.user._id,
      action: AUDIT_ACTIONS.TASK_FAILED,
      entity: { type: 'Task', id: task._id },
      metadata: {
        projectId: task.project,
        previousStatus,
      },
    });
  }

  if (populatedTask.retryCount > previousRetryCount) {
    await writeAuditLog({
      actor: req.user._id,
      action: AUDIT_ACTIONS.RETRY_ATTEMPTED,
      entity: { type: 'Task', id: task._id },
      metadata: {
        projectId: task.project,
        previousRetryCount,
        retryCount: populatedTask.retryCount,
      },
    });
    emitRetryAttempted({ task: populatedTask, previousRetryCount });
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    task: populatedTask,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await getAuthorizedTask(req.params.id, req.user._id, res);
  const projectId = task.project.toString();

  await Task.updateMany(
    { dependencies: task._id },
    { $pull: { dependencies: task._id } },
  );
  await task.deleteOne();
  emitTaskDeleted({ projectId, taskId: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
    taskId: req.params.id,
  });
});

export const getProjectTasks = asyncHandler(async (req, res) => {
  await getAuthorizedProject(req.params.projectId, req.user._id, res);

  const tasks = await Task.find({ project: req.params.projectId })
    .sort({ createdAt: -1 })
    .populate(taskPopulation);

  res.status(200).json({
    success: true,
    tasks,
  });
});

export const getTaskHistory = asyncHandler(async (req, res) => {
  const task = await getAuthorizedTask(req.params.id, req.user._id, res);

  const versions = await TaskVersion.find({ task: task._id })
    .sort({ versionNumber: -1 })
    .populate({ path: 'changedBy', select: 'name email' })
    .populate({ path: 'snapshot.dependencies', select: 'title status priority' });

  res.status(200).json({
    success: true,
    versions,
  });
});
