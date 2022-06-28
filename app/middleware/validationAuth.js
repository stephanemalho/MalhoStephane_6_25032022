const { validationResult } = require('express-validator');

const validationResultExpress = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() }); // Bad Request from express-validator controller
  }
  next();
}

module.exports = validationResultExpress;