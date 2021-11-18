const { clearCache } = require("../services/cache");

module.exports = async (req, res, next) => {
  await next(); //this will force the middleware to run when the route handler's work is done

  clearCache(req.user._id);
};
