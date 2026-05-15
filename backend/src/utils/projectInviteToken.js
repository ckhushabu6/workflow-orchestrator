import jwt from 'jsonwebtoken';

export const generateProjectInviteToken = (projectId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required.');
  }

  return jwt.sign(
    {
      type: 'project-invite',
      projectId,
    },
    jwtSecret,
    { expiresIn: '30m' },
  );
};

export const verifyProjectInviteToken = (token) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required.');
  }

  const decoded = jwt.verify(token, jwtSecret);

  if (decoded.type !== 'project-invite' || !decoded.projectId) {
    throw new Error('Invalid invite token.');
  }

  return decoded;
};
