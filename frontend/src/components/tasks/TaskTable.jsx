import TaskCard, { PriorityBadge, StatusBadge } from './TaskCard.jsx';

const getTaskId = (task) => task._id || task.id;

function TaskTable({ tasks, onEdit, onDelete, deletingTaskId }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
        <h3 className="text-lg font-bold text-white">No tasks yet</h3>
        <p className="mt-2 text-sm text-slate-400">
          Create the first task to start organizing this project.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:hidden">
        {tasks.map((task) => (
          <TaskCard
            isDeleting={deletingTaskId === getTaskId(task)}
            key={getTaskId(task)}
            onDelete={onDelete}
            onEdit={onEdit}
            task={task}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Dependencies
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resource
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Retry
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Version
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tasks.map((task) => {
                const taskId = getTaskId(task);
                const dependencies = task.dependencies || [];

                return (
                  <tr className="align-top" key={taskId}>
                    <td className="max-w-xs px-4 py-4">
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                        {task.description || 'No description'}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Estimate: {task.estimatedHours ?? 0}h
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="max-w-xs px-4 py-4 text-sm text-slate-300">
                      {dependencies.length > 0
                        ? dependencies
                            .map((dependency) => dependency.title || dependency)
                            .join(', ')
                        : 'None'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">
                      {task.resourceTag || 'Unassigned'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">
                      {task.retryCount ?? 0}/{task.maxRetries ?? 0}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-200">
                      v{task.versionNumber ?? 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
                          onClick={() => onEdit(task)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-rose-300/30 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={deletingTaskId === taskId}
                          onClick={() => onDelete(taskId)}
                          type="button"
                        >
                          {deletingTaskId === taskId ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default TaskTable;
