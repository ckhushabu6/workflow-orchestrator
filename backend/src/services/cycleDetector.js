const normalizeId = (value) => value?.toString();

const buildGraph = (tasks, pendingTask) => {
  const graph = new Map();

  tasks.forEach((task) => {
    graph.set(
      normalizeId(task._id),
      (task.dependencies || []).map(normalizeId).filter(Boolean),
    );
  });

  if (pendingTask) {
    graph.set(
      normalizeId(pendingTask.taskId),
      (pendingTask.dependencies || []).map(normalizeId).filter(Boolean),
    );
  }

  return graph;
};

const formatCyclePath = (path) => path.join(' -> ');

export const findDependencyCycle = (tasks, pendingTask) => {
  const graph = buildGraph(tasks, pendingTask);
  const visited = new Set();
  const visiting = new Set();
  const stack = [];

  const visit = (taskId) => {
    if (visiting.has(taskId)) {
      const cycleStartIndex = stack.indexOf(taskId);
      return [...stack.slice(cycleStartIndex), taskId];
    }

    if (visited.has(taskId)) {
      return null;
    }

    visiting.add(taskId);
    stack.push(taskId);

    const dependencies = graph.get(taskId) || [];

    for (const dependencyId of dependencies) {
      if (!graph.has(dependencyId)) {
        continue;
      }

      const cycle = visit(dependencyId);

      if (cycle) {
        return cycle;
      }
    }

    visiting.delete(taskId);
    visited.add(taskId);
    stack.pop();

    return null;
  };

  for (const taskId of graph.keys()) {
    const cycle = visit(taskId);

    if (cycle) {
      return cycle;
    }
  }

  return null;
};

export const assertAcyclicDependencies = (tasks, pendingTask) => {
  const cycle = findDependencyCycle(tasks, pendingTask);

  if (!cycle) {
    return;
  }

  throw new Error(
    `Cyclic task dependencies are not allowed. Cycle detected: ${formatCyclePath(cycle)}.`,
  );
};
