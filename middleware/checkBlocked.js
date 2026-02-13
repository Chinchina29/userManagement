const User = require('../models/userModel');

const checkBlocked = async (req, res, next) => {
  try {
    if (!req.session.user_id) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.user_id);

    if (!user || user.isBlocked) {
      return req.session.destroy(() => {
        res.clearCookie('user.ash');
        return res.redirect('/login');
      });
    }

    next();
  } catch (error) {
    console.log(error.message);
    return res.redirect('/login');
  }
};

module.exports = checkBlocked;
