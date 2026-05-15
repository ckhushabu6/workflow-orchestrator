import User from '../models/User.js';
import { AUDIT_ACTIONS, writeAuditLog } from '../services/auditLogger.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const buildAuthResponse = (user) => ({
  token: generateToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  },
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });
  await writeAuditLog({
    actor: user._id,
    action: AUDIT_ACTIONS.USER_SIGNUP,
    entity: { type: 'User', id: user._id },
    metadata: { email: user.email },
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    ...buildAuthResponse(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    '+password',
  );

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }
  await writeAuditLog({
    actor: user._id,
    action: AUDIT_ACTIONS.USER_LOGIN,
    entity: { type: 'User', id: user._id },
    metadata: { email: user.email },
  });

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    ...buildAuthResponse(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
