const emailPattern = /^\S+@\S+\.\S+$/;

const validate = (rules) => (req, res, next) => {
  const errors = rules(req.body);

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(' '));
  }

  next();
};

export const validateRegister = validate((body) => {
  const errors = [];
  const name = body.name?.trim();
  const email = body.email?.trim();

  if (!name || name.length < 2) {
    errors.push('Name must be at least 2 characters.');
  }

  if (!emailPattern.test(email || '')) {
    errors.push('A valid email is required.');
  }

  if (!body.password || body.password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  return errors;
});

export const validateLogin = validate((body) => {
  const errors = [];
  const email = body.email?.trim();

  if (!emailPattern.test(email || '')) {
    errors.push('A valid email is required.');
  }

  if (!body.password) {
    errors.push('Password is required.');
  }

  return errors;
});
