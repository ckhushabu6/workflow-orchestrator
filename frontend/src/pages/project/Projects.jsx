import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axios";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await axiosInstance.get("/projects");
      setProjects(data.projects || []);
    } catch (err) {
      setError("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await axiosInstance.post("/projects", {
        name,
        description,
      });

      setProjects((prev) => [data.project, ...prev]);

      setName("");
      setDescription("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Projects
          </h1>

          <p className="text-slate-400 mt-2">
            Manage collaborative workflow projects
          </p>
        </div>
      </div>

      <form
        onSubmit={handleCreateProject}
        className="rounded-xl border border-white/10 bg-white/[0.03] p-6 mb-8 space-y-4"
      >
        <h2 className="text-xl font-semibold text-white">
          Create Project
        </h2>

        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-white/10 px-4 py-3 text-white"
          required
        />

        <textarea
          placeholder="Project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-white/10 px-4 py-3 text-white"
          rows={4}
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300"
          >
            <h3 className="text-xl font-bold text-white">
              {project.name}
            </h3>

            <p className="mt-3 text-sm text-slate-400">
              {project.description}
            </p>

            <div className="mt-5 text-cyan-300 font-medium">
              Open Project →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Projects;