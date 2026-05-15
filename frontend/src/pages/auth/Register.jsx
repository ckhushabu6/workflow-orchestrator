import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import axiosInstance from '../../api/axios.js';
import { useAuthStore } from '../../store/authStore.js';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function Register() {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      const { data } = await axiosInstance.post('/auth/register', payload);
      const token = data.token || data.accessToken;
      const user = data.user || { name: formData.name, email: formData.email };

      if (!token) {
        throw new Error('Account created, but no token was returned.');
      }

      setAuth({ token, user });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Unable to create your account. Please try again.',
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
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-cyan-950/20 lg:grid-cols-[0.9fr_1fr]">
        <div className="order-2 flex items-center bg-slate-950 p-6 sm:p-10 lg:order-1">
          <form className="w-full" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-2xl font-bold text-white">Create account</h2>
              <p className="mt-2 text-sm text-slate-400">
                Already registered?{' '}
                <Link
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                  to="/login"
                >
                  Sign in
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
                  Name
                </span>
                <input
                  autoComplete="name"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  name="name"
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  type="text"
                  value={formData.name}
                />
              </label>

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
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  minLength={6}
                  name="password"
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  type="password"
                  value={formData.password}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  Confirm password
                </span>
                <input
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  minLength={6}
                  name="confirmPassword"
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                  type="password"
                  value={formData.confirmPassword}
                />
              </label>
            </div>

            <button
              className="mt-8 flex w-full items-center justify-center rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <div className="order-1 flex flex-col justify-between border-b border-white/10 bg-slate-900/80 p-8 lg:order-2 lg:border-b-0 lg:border-l lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              Start secure
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-bold text-white sm:text-5xl">
              Create your workspace access in seconds.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Your token is persisted locally and sent automatically with API
              requests that need authorization.
            </p>
          </div>
          <div className="mt-10 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm leading-6 text-cyan-50">
            After registration, you will be redirected to the protected
            dashboard automatically.
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
