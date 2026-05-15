import { useAppStore } from '../store/useAppStore.js';
import { useAuthStore } from '../store/authStore.js';

function HomePage() {
  const appName = useAppStore((state) => state.appName);
  const user = useAuthStore((state) => state.user);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              Protected dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              {appName}
            </h1>
          </div>
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100">
            Session active
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="text-sm font-medium text-slate-400">Signed in as</p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            {user?.name || user?.email || 'Authenticated user'}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Your JWT is persisted in localStorage and attached to API requests
            through the Axios authorization interceptor.
          </p>
        </article>

        <aside className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-200">
            Auth status
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
            <span className="text-sm font-medium text-cyan-50">
              Protected layout enabled
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default HomePage;
