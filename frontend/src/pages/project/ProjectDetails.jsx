import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import axiosInstance from '../../api/axios.js';
import TaskModal from '../../components/tasks/TaskModal.jsx';
import TaskTable from '../../components/tasks/TaskTable.jsx';
import socket from '../../sockets/socket.js';

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || error.message || fallbackMessage;

const getTaskId = (task) => {
  if (!task) return null;

  return task._id || task.id || null;
};

function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [inviteLink, setInviteLink] = useState('');
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create',
    task: null,
  });

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0),
      ),
    [tasks],
  );

  const fetchProjectTasks = useCallback(
    async ({ silent = false } = {}) => {
      try {
        const { data } = await axiosInstance.get(`/tasks/project/${projectId}`);
        setTasks(data.tasks || []);
      } catch (error) {
        if (!silent) {
          setPageError(getErrorMessage(error, 'Unable to load project tasks.'));
        }
      }
    },
    [projectId],
  );

  const fetchProjectDetails = useCallback(async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const [projectResponse, tasksResponse] = await Promise.all([
        axiosInstance.get(`/projects/${projectId}`),
        axiosInstance.get(`/tasks/project/${projectId}`),
      ]);

      setProject(projectResponse.data.project || projectResponse.data);
      setTasks(tasksResponse.data.tasks || []);
    } catch (error) {
      setPageError(getErrorMessage(error, 'Unable to load project details.'));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // Data load is intentionally started when the route project ID changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    const realtimeEvents = [
      'taskCreated',
      'taskUpdated',
      'taskDeleted',
      'taskStatusChanged',
      'retryAttempted',
    ];

    const refreshTasks = () => {
      fetchProjectTasks({ silent: true });
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('joinProject', projectId);
    realtimeEvents.forEach((eventName) => {
      socket.on(eventName, refreshTasks);
    });

    return () => {
      socket.emit('leaveProject', projectId);
      realtimeEvents.forEach((eventName) => {
        socket.off(eventName, refreshTasks);
      });
    };
  }, [fetchProjectTasks, projectId]);

  const openCreateModal = () => {
    setModalError('');
    setModalState({ isOpen: true, mode: 'create', task: null });
  };

  const openEditModal = (task) => {
    setModalError('');
    setModalState({ isOpen: true, mode: 'edit', task });
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setModalState({ isOpen: false, mode: 'create', task: null });
    setModalError('');
  };


  const handleGenerateInvite = async () => {
  try {
    const { data } = await axiosInstance.post(
      `/projects/${projectId}/invite-token`
    );

    const token = data.token || data.inviteToken;

    const link =
      `http://localhost:5173/join/${token}`;

    setInviteLink(link);
  } catch (error) {
    console.log(error);
  }
};

  const handleSaveTask = async (payload) => {
    setIsSaving(true);
    setModalError('');

    try {
      if (modalState.mode === 'edit') {
        const taskId = getTaskId(modalState.task);
        const { data } = await axiosInstance.put(`/tasks/${taskId}`, payload);
        const updatedTask = data.task || data;

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            getTaskId(task) === getTaskId(updatedTask) ? updatedTask : task,
          ),
        );
      } else {
        const { data } = await axiosInstance.post('/tasks', {
          ...payload,
          projectId,
        });
        const createdTask = data.task || data;

        setTasks((currentTasks) => [createdTask, ...currentTasks]);
      }

      closeModal();
    } catch (error) {
      setModalError(getErrorMessage(error, 'Unable to save task.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm('Delete this task? This cannot be undone.');

    if (!confirmed) {
      return;
    }

    const previousTasks = tasks;
    setDeletingTaskId(taskId);
    setPageError('');
    setTasks((currentTasks) =>
      currentTasks.filter((task) => getTaskId(task) !== taskId),
    );

    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
    } catch (error) {
      setTasks(previousTasks);
      setPageError(getErrorMessage(error, 'Unable to delete task.'));
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-slate-300">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
          Loading project tasks...
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
            to="/"
          >
            Back to dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            {project?.name || 'Project details'}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            {project?.description || 'Manage project execution tasks, retries, dependencies, and resources.'}
          </p>
        </div>

        <button
          className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          onClick={openCreateModal}
          type="button"
        >
          Create task
        </button>

        <button
  className="rounded-lg border border-cyan-300 px-4 py-3 text-sm font-bold text-cyan-300"
  onClick={handleGenerateInvite}
  type="button"
>
  Generate Invite
</button>
{inviteLink && (
  <div className="mt-4 rounded-lg bg-slate-900 p-3 text-sm text-cyan-300 break-all">
    {inviteLink}
  </div>
)}
      </div>

      {pageError ? (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {pageError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">Total tasks</p>
          <p className="mt-2 text-3xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">Running</p>
          <p className="mt-2 text-3xl font-bold text-cyan-200">
            {tasks.filter((task) => task.status === 'Running').length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">Blocked</p>
          <p className="mt-2 text-3xl font-bold text-amber-200">
            {tasks.filter((task) => task.status === 'Blocked').length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-200">
            {tasks.filter((task) => task.status === 'Completed').length}
          </p>
        </div>
      </div>

      <TaskTable
        deletingTaskId={deletingTaskId}
        onDelete={handleDeleteTask}
        onEdit={openEditModal}
        tasks={sortedTasks}
      />

      <TaskModal
        error={modalError}
        isOpen={modalState.isOpen}
        isSaving={isSaving}
        key={`${modalState.mode}-${getTaskId(modalState.task) || 'new'}-${modalState.isOpen}`}
        mode={modalState.mode}
        onClose={closeModal}
        onSubmit={handleSaveTask}
        task={modalState.task}
        tasks={tasks}
      />
    </section>
  );
}

export default ProjectDetails;
