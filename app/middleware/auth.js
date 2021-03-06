const jwt = require("jsonwebtoken");

// create a token for the user in reference of its id
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
    const userId = decodedToken.userId;
    req.auth = { userID: userId };
    if (req.body.userId && req.body.userId !== userId) {
      // if the userId doen't match with the token userId:
      throw "Invalid user ID";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};

