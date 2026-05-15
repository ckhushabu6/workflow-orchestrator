import { emitToProject } from './socketServer.js';

const getProjectIdFromTask = (task) => {
  const project = task?.project;

  if (!project) {
    return null;
  }

  return project._id?.toString() || project.toString();
};

export const emitTaskCreated = (task) => {
  emitToProject(getProjectIdFromTask(task), 'taskCreated', { task });
};

export const emitTaskUpdated = (task) => {
  emitToProject(getProjectIdFromTask(task), 'taskUpdated', { task });
};

export const emitTaskDeleted = ({ projectId, taskId }) => {
  emitToProject(projectId, 'taskDeleted', { taskId });
};

export const emitTaskStatusChanged = ({ task, previousStatus }) => {
  emitToProject(getProjectIdFromTask(task), 'taskStatusChanged', {
    task,
    previousStatus,
    status: task.status,
  });
};

export const emitRetryAttempted = ({ task, previousRetryCount }) => {
  emitToProject(getProjectIdFromTask(task), 'retryAttempted', {
    task,
    previousRetryCount,
    retryCount: task.retryCount,
  });
};
