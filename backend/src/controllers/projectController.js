import jwt from 'jsonwebtoken';

import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { AUDIT_ACTIONS, writeAuditLog } from '../services/auditLogger.js';
import { computeExecutionPlan } from '../services/executionPlanner.js';
import { simulateDailyExecution } from '../services/simulationEngine.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  generateProjectInviteToken,
  verifyProjectInviteToken,
} from '../utils/projectInviteToken.js';

const projectPopulation = [
  { path: 'owner', select: 'name email' },
  { path: 'members', select: 'name email' },
];

const populateProject = (query) => query.populate(projectPopulation);

export const createProject = asyncHandler(async (req, res) => {
  const { name, description = '', webhookUrl = '' } = req.body;

  const project = await Project.create({
    name: name.trim(),
    description: description.trim(),
    webhookUrl: webhookUrl.trim(),
    owner: req.user._id,
    members: [req.user._id],
  });

  const populatedProject = await populateProject(Project.findById(project._id));
  await writeAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.PROJECT_CREATED,
    entity: { type: 'Project', id: project._id },
    metadata: { name: project.name },
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully.',
    project: populatedProject,
  });
});

export const getUserProjects = asyncHandler(async (req, res) => {
  const projects = await populateProject(
    Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).sort({ updatedAt: -1 }),
  );

  res.status(200).json({
    success: true,
    projects,
  });
});

export const generateInviteToken = asyncHandler(async (req, res) => {
  const inviteToken = generateProjectInviteToken(req.project._id);
  await writeAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.INVITE_GENERATED,
    entity: { type: 'Project', id: req.project._id },
    metadata: { expiresInSeconds: 30 * 60 },
  });

  res.status(200).json({
    success: true,
    message: 'Invite token generated successfully.',
    inviteToken,
    expiresIn: 30 * 60,
  });
});

export const joinProject = asyncHandler(async (req, res) => {
  const inviteToken = req.body.inviteToken || req.body.token || req.body.code;
  let decoded;

  try {
    decoded = verifyProjectInviteToken(inviteToken);
  } catch (error) {
    res.status(401);
    throw new Error(
      error instanceof jwt.TokenExpiredError
        ? 'Invite token has expired.'
        : 'Invite token is invalid.',
    );
  }

  const project = await Project.findById(decoded.projectId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  const alreadyMember = project.members.some(
    (memberId) => memberId.toString() === req.user._id.toString(),
  );

  if (!alreadyMember) {
    project.members.push(req.user._id);
    await project.save();
    await writeAuditLog({
      actor: req.user._id,
      action: AUDIT_ACTIONS.MEMBER_JOINED,
      entity: { type: 'Project', id: project._id },
      metadata: { memberId: req.user._id },
    });
  }

  const populatedProject = await populateProject(Project.findById(project._id));

  res.status(200).json({
    success: true,
    message: alreadyMember
      ? 'You are already a member of this project.'
      : 'Joined project successfully.',
    project: populatedProject,
  });
});

export const computeProjectExecution = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ project: req.project._id }).sort({
    createdAt: 1,
  });
  const executionPlan = computeExecutionPlan(tasks);

  res.status(200).json({
    success: true,
    ...executionPlan,
  });
});

export const simulateProjectExecution = asyncHandler(async (req, res) => {
  const { availableHours, failedTaskIds = [] } = req.body;
  const parsedAvailableHours = Number(availableHours);

  if (!Number.isFinite(parsedAvailableHours) || parsedAvailableHours < 0) {
    res.status(400);
    throw new Error('availableHours must be a number greater than or equal to 0.');
  }

  if (!Array.isArray(failedTaskIds)) {
    res.status(400);
    throw new Error('failedTaskIds must be an array.');
  }

  const tasks = await Task.find({ project: req.project._id }).sort({
    createdAt: 1,
  });
  const simulation = simulateDailyExecution({
    tasks,
    availableHours: parsedAvailableHours,
    failedTaskIds,
  });

  res.status(200).json({
    success: true,
    ...simulation,
  });
});
