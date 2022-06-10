const { validationResult } = require('express-validator');

const validationResultExpress = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() }); // Bad Request from express-validator controller
  }
  next();
}
module.exports = validationResultExpress;

bodyLoginValidator = [
  body("email", "Format incorrect").trim().isEmail().normalizeEmail(),
  body("password", "Format incorrect").trim().isLength({ min: 6 , max: 64}),
]

module.exports = bodyLoginValidator;