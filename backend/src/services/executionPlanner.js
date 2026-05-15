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

export const computeExecutionPlan = (tasks) => {
  const blockedTasks = tasks.filter((task) => task.status === 'Blocked');
  const blockedTaskIds = new Set(blockedTasks.map((task) => normalizeId(task._id)));
  const taskById = new Map(tasks.map((task) => [normalizeId(task._id), task]));
  const executableTaskById = new Map();
  const skippedTasks = [];
  const skippedTaskIds = new Set();

  tasks.forEach((task) => {
    const taskId = normalizeId(task._id);

    if (blockedTaskIds.has(taskId)) {
      return;
    }

    const dependencies = (task.dependencies || []).map(normalizeId).filter(Boolean);

    const incompleteDependency = dependencies.find((dependencyId) => {
  const dependencyTask = taskById.get(dependencyId);

  return (
    dependencyTask &&
    dependencyTask.status !== 'Completed'
  );
});
    const blockedDependency = dependencies.find((dependencyId) =>
      blockedTaskIds.has(dependencyId),
    );
    const missingDependency = dependencies.find(
      (dependencyId) => !taskById.has(dependencyId),
    );

    if (incompleteDependency) {
  skippedTaskIds.add(taskId);

  skippedTasks.push(
    createSkippedTask(
      task,
      `Depends on incomplete task ${incompleteDependency}.`,
    ),
  );

  return;
}

    if (blockedDependency) {
      skippedTaskIds.add(taskId);
      skippedTasks.push(
        createSkippedTask(
          task,
          `Depends on blocked task ${blockedDependency}.`,
        ),
      );
      return;
    }

    if (missingDependency) {
      skippedTaskIds.add(taskId);
      skippedTasks.push(
        createSkippedTask(
          task,
          `Depends on missing task ${missingDependency}.`,
        ),
      );
      return;
    }

    executableTaskById.set(taskId, task);
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const [taskId, task] of executableTaskById.entries()) {
      const hasSkippedDependency = (task.dependencies || [])
        .map(normalizeId)
        .some((dependencyId) => skippedTaskIds.has(dependencyId));

      if (hasSkippedDependency) {
        executableTaskById.delete(taskId);
        skippedTaskIds.add(taskId);
        skippedTasks.push(
          createSkippedTask(task, 'Depends on a skipped task.'),
        );
        changed = true;
      }
    }
  }

  const indegree = new Map();
  const dependentsByTaskId = new Map();

  for (const taskId of executableTaskById.keys()) {
    indegree.set(taskId, 0);
    dependentsByTaskId.set(taskId, []);
  }

  for (const [taskId, task] of executableTaskById.entries()) {
    const dependencies = (task.dependencies || [])
      .map(normalizeId)
      .filter((dependencyId) => executableTaskById.has(dependencyId));

    dependencies.forEach((dependencyId) => {
      indegree.set(taskId, indegree.get(taskId) + 1);
      dependentsByTaskId.get(dependencyId).push(taskId);
    });
  }

  const readyQueue = [...executableTaskById.keys()]
    .filter((taskId) => indegree.get(taskId) === 0)
    .map((taskId) => executableTaskById.get(taskId))
    .sort(compareTasks);
  const executionOrder = [];

  while (readyQueue.length > 0) {
    const task = readyQueue.shift();
    const taskId = normalizeId(task._id);

    executionOrder.push(task);

    dependentsByTaskId.get(taskId).forEach((dependentTaskId) => {
      indegree.set(dependentTaskId, indegree.get(dependentTaskId) - 1);

      if (indegree.get(dependentTaskId) === 0) {
        readyQueue.push(executableTaskById.get(dependentTaskId));
        readyQueue.sort(compareTasks);
      }
    });
  }

  if (executionOrder.length !== executableTaskById.size) {
    const orderedTaskIds = new Set(
      executionOrder.map((task) => normalizeId(task._id)),
    );

    for (const [taskId, task] of executableTaskById.entries()) {
      if (!orderedTaskIds.has(taskId)) {
        skippedTasks.push(
          createSkippedTask(task, 'Skipped because a dependency cycle exists.'),
        );
      }
    }
  }

  return {
    executionOrder,
    blockedTasks,
    skippedTasks,
  };
};
