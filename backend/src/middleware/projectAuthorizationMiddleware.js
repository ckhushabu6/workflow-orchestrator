import Project from '../models/Project.js';
import asyncHandler from '../utils/asyncHandler.js';

const isSameId = (left, right) => left?.toString() === right?.toString();

export const loadProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  req.project = project;
  next();
});

export const authorizeProjectMember = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const isOwner = isSameId(req.project.owner, userId);
  const isMember = req.project.members.some((memberId) =>
    isSameId(memberId, userId),
  );

  if (!isOwner && !isMember) {
    res.status(403);
    throw new Error('You are not authorized to access this project.');
  }

  next();
});

export const authorizeProjectOwner = asyncHandler(async (req, res, next) => {
  if (!isSameId(req.project.owner, req.user._id)) {
    res.status(403);
    throw new Error('Only the project owner can perform this action.');
  }

  next();
});
