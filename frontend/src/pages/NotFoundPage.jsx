import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
        404
      </p>
      <h1 className="mt-4 text-4xl font-bold text-white">Page not found</h1>
      <Link
        className="mt-8 inline-flex w-fit items-center rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        to="/"
      >
        Back home
      </Link>
    </section>
  );
}

export default NotFoundPage;
