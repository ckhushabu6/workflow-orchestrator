import mongoose from 'mongoose';

import { TASK_PRIORITIES, TASK_STATUSES } from '../models/Task.js';

const validate = (rules) => (req, res, next) => {
  const errors = rules(req.body, req.params);

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(' '));
  }

  next();
};

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validateNumber = (value, fieldName, min) => {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== 'number' || Number.isNaN(value) || value < min) {
    return `${fieldName} must be a number greater than or equal to ${min}.`;
  }

  return null;
};

const validateTaskFields = (body, { requireProject = false } = {}) => {
  const errors = [];
  const title = body.title?.trim();
  const description = body.description?.trim();
  const resourceTag = body.resourceTag?.trim();

  if (requireProject && !isObjectId(body.projectId || body.project)) {
    errors.push('A valid projectId is required.');
  }

  if (body.title !== undefined && (!title || title.length < 2)) {
    errors.push('Task title must be at least 2 characters.');
  }

  if (title?.length > 160) {
    errors.push('Task title cannot exceed 160 characters.');
  }

  if (description?.length > 2000) {
    errors.push('Description cannot exceed 2000 characters.');
  }

  if (body.priority !== undefined && !TASK_PRIORITIES.includes(body.priority)) {
    errors.push(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}.`);
  }

  if (body.status !== undefined && !TASK_STATUSES.includes(body.status)) {
    errors.push(`Status must be one of: ${TASK_STATUSES.join(', ')}.`);
  }

  if (resourceTag?.length > 80) {
    errors.push('Resource tag cannot exceed 80 characters.');
  }

  if (Array.isArray(body.dependencies)) {
    const hasInvalidDependency = body.dependencies.some(
      (dependencyId) => !isObjectId(dependencyId),
    );

    if (hasInvalidDependency) {
      errors.push('Dependencies must contain valid task IDs.');
    }
  } else if (body.dependencies !== undefined) {
    errors.push('Dependencies must be an array of task IDs.');
  }

  [
    validateNumber(body.estimatedHours, 'Estimated hours', 0),
    validateNumber(body.maxRetries, 'Max retries', 0),
    validateNumber(body.retryCount, 'Retry count', 0),
    validateNumber(body.versionNumber, 'Version number', 1),
  ].forEach((error) => {
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};

export const validateCreateTask = validate((body) => {
  const errors = validateTaskFields(body, { requireProject: true });

  if (!body.title) {
    errors.push('Task title is required.');
  }

  return errors;
});

export const validateUpdateTask = validate((body) => {
  if (Object.keys(body).length === 0) {
    return ['At least one task field is required.'];
  }

  const errors = validateTaskFields(body);

  if (body.versionNumber === undefined) {
    errors.push('versionNumber is required for task updates.');
  }

  return errors;
});

export const validateTaskIdParam = (req, res, next) => {
  if (!isObjectId(req.params.id)) {
    res.status(400);
    throw new Error('A valid task ID is required.');
  }

  next();
};

export const validateProjectIdParam = (req, res, next) => {
  if (!isObjectId(req.params.projectId)) {
    res.status(400);
    throw new Error('A valid project ID is required.');
  }

  next();
};
