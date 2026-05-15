const isValidUrl = (value) => {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const validate = (rules) => (req, res, next) => {
  const errors = rules(req.body);

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(' '));
  }

  next();
};

export const validateCreateProject = validate((body) => {
  const errors = [];
  const name = body.name?.trim();
  const description = body.description?.trim();
  const webhookUrl = body.webhookUrl?.trim();

  if (!name || name.length < 2) {
    errors.push('Project name must be at least 2 characters.');
  }

  if (name?.length > 120) {
    errors.push('Project name cannot exceed 120 characters.');
  }

  if (description?.length > 1000) {
    errors.push('Description cannot exceed 1000 characters.');
  }

  if (!isValidUrl(webhookUrl)) {
    errors.push('Webhook URL must be a valid HTTP or HTTPS URL.');
  }

  return errors;
});

export const validateJoinProject = validate((body) => {
  const errors = [];

  if (!body.inviteToken && !body.token && !body.code) {
    errors.push('Invite token is required.');
  }

  return errors;
});
