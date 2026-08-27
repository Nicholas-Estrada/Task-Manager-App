module.exports = {
  auth: (req, res, next) => {
    req.user = req.user || { id: 'demo_user' };
    next();
  },
};
