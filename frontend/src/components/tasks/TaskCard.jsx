const statusStyles = {
  Pending: 'border-slate-400/30 bg-slate-400/10 text-slate-100',
  Running: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
  Completed: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
  Failed: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
  Blocked: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
};

const priorityStyles = {
  Low: 'border-slate-400/30 bg-slate-400/10 text-slate-100',
  Medium: 'border-sky-300/30 bg-sky-300/10 text-sky-100',
  High: 'border-orange-300/30 bg-orange-300/10 text-orange-100',
  Critical: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
};

export const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
      statusStyles[status] || statusStyles.Pending
    }`}
  >
    {status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
      priorityStyles[priority] || priorityStyles.Medium
    }`}
  >
    {priority}
  </span>
);

const getTaskId = (task) => task._id || task.id;

function TaskCard({ task, onEdit, onDelete, isDeleting }) {
  const dependencies = task.dependencies || [];

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-lg shadow-slate-950/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-white">
            {task.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
            {task.description || 'No description'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Resource</p>
          <p className="mt-1 font-medium text-slate-100">
            {task.resourceTag || 'Unassigned'}
          </p>
        </div>
        <div className="rounded-lg bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Retries</p>
          <p className="mt-1 font-medium text-slate-100">
            {task.retryCount ?? 0}/{task.maxRetries ?? 0}
          </p>
        </div>
        <div className="rounded-lg bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Estimate</p>
          <p className="mt-1 font-medium text-slate-100">
            {task.estimatedHours ?? 0}h
          </p>
        </div>
        <div className="rounded-lg bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Version</p>
          <p className="mt-1 font-medium text-slate-100">
            v{task.versionNumber ?? 1}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-900/70 p-3">
        <p className="text-xs text-slate-500">Dependencies</p>
        <p className="mt-1 text-sm text-slate-200">
          {dependencies.length > 0
            ? dependencies.map((dependency) => dependency.title || dependency).join(', ')
            : 'None'}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
          onClick={() => onEdit(task)}
          type="button"
        >
          Edit
        </button>
        <button
          className="flex-1 rounded-lg border border-rose-300/30 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDeleting}
          onClick={() => onDelete(getTaskId(task))}
          type="button"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
