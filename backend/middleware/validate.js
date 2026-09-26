export const validate = (schema) => (req, res, next) => {
  const method = req.method.toUpperCase();
  let source;

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const bodyKeys = Object.keys(req.body || {});
    if (bodyKeys.length === 0) {
      source = { ...req.body, ...req.params };
    } else {
      source = req.body;
    }
  } else if (['GET', 'DELETE'].includes(method)) {
    source = { ...req.query, ...req.params };
  } else {
    source = req.params;
  }

  const { error } = schema.validate(source);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};