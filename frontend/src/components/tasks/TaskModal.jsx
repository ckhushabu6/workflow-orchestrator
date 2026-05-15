import { useMemo, useState } from 'react';

const statusOptions = ['Pending', 'Running', 'Completed', 'Failed', 'Blocked'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

const defaultFormState = {
  title: '',
  description: '',
  priority: 'Medium',
  estimatedHours: 0,
  status: 'Pending',
  dependencies: [],
  resourceTag: '',
  maxRetries: 0,
  retryCount: 0,
  versionNumber: 1,
};

const getTaskId = (task) => task?._id || task?.id;

const getInitialFormState = (task) => {
  if (!task) {
    return defaultFormState;
  }

  return {
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    estimatedHours: task.estimatedHours ?? 0,
    status: task.status || 'Pending',
    dependencies: (task.dependencies || []).map((dependency) =>
      getTaskId(dependency) || dependency,
    ),
    resourceTag: task.resourceTag || '',
    maxRetries: task.maxRetries ?? 0,
    retryCount: task.retryCount ?? 0,
    versionNumber: task.versionNumber ?? 1,
  };
};

function TaskModal({ isOpen, mode, task, tasks, error, isSaving, onClose, onSubmit }) {
  const [formData, setFormData] = useState(() => getInitialFormState(task));

  const dependencyOptions = useMemo(
    () => tasks.filter((option) => getTaskId(option) !== getTaskId(task)),
    [task, tasks],
  );

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleDependencyToggle = (dependencyId) => {
    setFormData((current) => ({
      ...current,
      dependencies: current.dependencies.includes(dependencyId)
        ? current.dependencies.filter((id) => id !== dependencyId)
        : [...current.dependencies, dependencyId],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        aria-label="Close task modal"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <form
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/40"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              {mode === 'edit' ? 'Edit task' : 'Create task'}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {mode === 'edit' ? formData.title || 'Update task' : 'New task'}
            </h2>
          </div>
          <button
            className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-200">Title</span>
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              name="title"
              onChange={handleChange}
              placeholder="Provision deployment workflow"
              required
              type="text"
              value={formData.title}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-200">
              Description
            </span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              name="description"
              onChange={handleChange}
              placeholder="Describe task details, constraints, and expectations."
              value={formData.description}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">Status</span>
            <select
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              name="status"
              onChange={handleChange}
              value={formData.status}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">Priority</span>
            <select
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              name="priority"
              onChange={handleChange}
              value={formData.priority}
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">
              Estimated hours
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              min="0"
              name="estimatedHours"
              onChange={handleChange}
              type="number"
              value={formData.estimatedHours}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">
              Resource tag
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              name="resourceTag"
              onChange={handleChange}
              placeholder="backend, ai-worker, infra"
              type="text"
              value={formData.resourceTag}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">
              Max retries
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              min="0"
              name="maxRetries"
              onChange={handleChange}
              type="number"
              value={formData.maxRetries}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">
              Retry count
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              min="0"
              name="retryCount"
              onChange={handleChange}
              type="number"
              value={formData.retryCount}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">
              Version number
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
              min="1"
              name="versionNumber"
              onChange={handleChange}
              type="number"
              value={formData.versionNumber}
            />
          </label>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-slate-200">Dependencies</p>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-slate-900 p-3">
              {dependencyOptions.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {dependencyOptions.map((dependency) => {
                    const dependencyId = getTaskId(dependency);

                    return (
                      <label
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-200 hover:bg-white/5"
                        key={dependencyId}
                      >
                        <input
                          checked={formData.dependencies.includes(dependencyId)}
                          className="h-4 w-4 rounded border-white/20 bg-slate-950 text-cyan-300"
                          onChange={() => handleDependencyToggle(dependencyId)}
                          type="checkbox"
                        />
                        <span className="truncate">{dependency.title}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No other tasks available.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskModal;
