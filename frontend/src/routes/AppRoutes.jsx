import { Route, Routes } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout.jsx';
import HomePage from '../pages/HomePage.jsx';

import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

import Projects from '../pages/project/Projects.jsx';
import ProjectDetails from '../pages/project/ProjectDetails.jsx';

import NotFoundPage from '../pages/NotFoundPage.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* Dashboard */}
          <Route index element={<HomePage />} />

          {/* Projects */}
          <Route path="projects" element={<Projects />} />

          {/* Single Project */}
          <Route
            path="projects/:projectId"
            element={<ProjectDetails />}
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />

        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;