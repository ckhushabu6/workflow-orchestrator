const priorityWeight = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const normalizeId = (value) => value?.toString();

const compareTasks = (left, right) => {
  const priorityDifference =
    (priorityWeight[right.priority] || 0) - (priorityWeight[left.priority] || 0);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const estimatedHoursDifference =
    (left.estimatedHours || 0) - (right.estimatedHours || 0);

  if (estimatedHoursDifference !== 0) {
    return estimatedHoursDifference;
  }

  const createdAtDifference =
    new Date(left.createdAt || 0).getTime() -
    new Date(right.createdAt || 0).getTime();

  if (createdAtDifference !== 0) {
    return createdAtDifference;
  }

  return normalizeId(left._id).localeCompare(normalizeId(right._id));
};

const createSkippedTask = (task, reason) => ({
  task,
  reason,
});

const getDependencies = (task) =>
  (task.dependencies || []).map(normalizeId).filter(Boolean);

const createTaskMaps = (tasks) => ({
  taskById: new Map(tasks.map((task) => [normalizeId(task._id), task])),
  completedTaskIds: new Set(
    tasks
      .filter((task) => task.status === 'Completed')
      .map((task) => normalizeId(task._id)),
  ),
});

const collectInitialSkippedTasks = ({ tasks, taskById, failedTaskIds }) => {
  const failedTaskIdSet = new Set(failedTaskIds.map(normalizeId).filter(Boolean));
  const skippedTasks = [];
  const skippedTaskIds = new Set();
  const blockedTasks = [];
  const candidateTaskById = new Map();

  tasks.forEach((task) => {
    const taskId = normalizeId(task._id);

    if (task.status === 'Completed') {
      return;
    }

    if (task.status === 'Blocked') {
      blockedTasks.push(task);
      skippedTaskIds.add(taskId);
      return;
    }

    if (task.status === 'Failed' || failedTaskIdSet.has(taskId)) {
      skippedTaskIds.add(taskId);
      skippedTasks.push(createSkippedTask(task, 'Task is failed for this simulation.'));
      return;
    }

    const missingDependency = getDependencies(task).find(
      (dependencyId) => !taskById.has(dependencyId),
    );

    if (missingDependency) {
      skippedTaskIds.add(taskId);
      skippedTasks.push(
        createSkippedTask(task, `Depends on missing task ${missingDependency}.`),
      );
      return;
    }

    candidateTaskById.set(taskId, task);
  });

  return {
    blockedTasks,
    candidateTaskById,
    skippedTaskIds,
    skippedTasks,
  };
};

const propagateSkippedDependencies = ({ candidateTaskById, skippedTaskIds, skippedTasks }) => {
  let changed = true;

  while (changed) {
    changed = false;

    for (const [taskId, task] of candidateTaskById.entries()) {
      const hasSkippedDependency = getDependencies(task).some((dependencyId) =>
        skippedTaskIds.has(dependencyId),
      );

      if (hasSkippedDependency) {
        candidateTaskById.delete(taskId);
        skippedTaskIds.add(taskId);
        skippedTasks.push(createSkippedTask(task, 'Depends on a skipped task.'));
        changed = true;
      }
    }
  }
};

const findBestFittingReadyTaskIndex = (readyTasks, remainingHours) =>
  readyTasks.findIndex((task) => (task.estimatedHours || 0) <= remainingHours);

export const simulateDailyExecution = ({
  tasks,
  availableHours,
  failedTaskIds = [],
}) => {
  const { taskById, completedTaskIds } = createTaskMaps(tasks);
  const {
    blockedTasks,
    candidateTaskById,
    skippedTaskIds,
    skippedTasks,
  } = collectInitialSkippedTasks({ tasks, taskById, failedTaskIds });

  propagateSkippedDependencies({
    candidateTaskById,
    skippedTaskIds,
    skippedTasks,
  });

  const selectedTaskIds = new Set();
  const executionOrder = [];
  let remainingHours = availableHours;
  let totalPriorityScore = 0;
  let progressed = true;

  while (progressed) {
    progressed = false;

    const readyTasks = [...candidateTaskById.values()]
      .filter((task) =>
        getDependencies(task).every(
          (dependencyId) =>
            completedTaskIds.has(dependencyId) ||
            selectedTaskIds.has(dependencyId),
        ),
      )
      .sort(compareTasks);

    if (readyTasks.length === 0) {
      break;
    }

    const selectedIndex = findBestFittingReadyTaskIndex(
      readyTasks,
      remainingHours,
    );

    if (selectedIndex === -1) {
      break;
    }

    const selectedTask = readyTasks[selectedIndex];
    const selectedTaskId = normalizeId(selectedTask._id);

    candidateTaskById.delete(selectedTaskId);
    selectedTaskIds.add(selectedTaskId);
    executionOrder.push(selectedTask);
    remainingHours -= selectedTask.estimatedHours || 0;
    totalPriorityScore += priorityWeight[selectedTask.priority] || 0;
    progressed = true;
  }

  for (const [taskId, task] of candidateTaskById.entries()) {
    const unmetDependencies = getDependencies(task).filter(
      (dependencyId) =>
        !completedTaskIds.has(dependencyId) && !selectedTaskIds.has(dependencyId),
    );

    skippedTaskIds.add(taskId);
    skippedTasks.push(
      createSkippedTask(
        task,
        unmetDependencies.length > 0
          ? 'Dependencies were not selected in this simulation.'
          : 'Insufficient available hours.',
      ),
    );
  }

  return {
    executionOrder,
    selectedTasks: executionOrder,
    blockedTasks,
    skippedTasks,
    totalPriorityScore,
  };
};
