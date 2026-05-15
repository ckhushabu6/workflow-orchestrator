import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import axiosInstance from '../../api/axios.js';
import { useAuthStore } from '../../store/authStore.js';

const initialFormState = {
  email: '',
  password: '',
};

function Login() {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || '/';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await axiosInstance.post('/auth/login', formData);
      const token = data.token || data.accessToken;
      const user = data.user || null;

      if (!token) {
        throw new Error('Login succeeded, but no token was returned.');
      }

      setAuth({ token, user });
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Unable to log in. Please check your credentials and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <section className="flex min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-cyan-950/20 lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col justify-between border-b border-white/10 bg-slate-900/80 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              Welcome back
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-bold text-white sm:text-5xl">
              Sign in to manage your workflow orchestration.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Access protected workflows, monitor execution, and keep your
              workspace moving from one secure dashboard.
            </p>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-slate-300 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              JWT persistence
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              Protected routes
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              Secure API calls
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-6 sm:p-10">
          <form className="w-full" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-2xl font-bold text-white">Login</h2>
              <p className="mt-2 text-sm text-slate-400">
                New here?{' '}
                <Link
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                  to="/register"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {error ? (
              <div className="mt-6 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  Email
                </span>
                <input
                  autoComplete="email"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  name="email"
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={formData.email}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  Password
                </span>
                <input
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  name="password"
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={formData.password}
                />
              </label>
            </div>

            <button
              className="mt-8 flex w-full items-center justify-center rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
