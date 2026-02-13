
const User = require('../models/userModel.js')

const isLogin = async (req, res, next) => {
  try {
    if (!req.session.user_id) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.user_id);
    
    if (!user) {
      req.session.destroy(() => {
        return res.redirect('/login'); 
      });
      return;
    }

    if (user.isBlocked) {
      req.session.destroy(() => {
        return res.redirect('/login'); 
      });
      return;
    }

    if (user.is_admin === 1) {
      req.session.destroy(() => {
        return res.redirect('/admin'); 
      });
      return;
    }

    if (req.session.admin_id) {
      req.session.admin_id = null;
      req.session.admin = null;
      req.session.isAdmin = false;
    }

    res.set("Cache-Control", "no-store");
    next();
  } catch (error) {
    console.log('User auth middleware error:', error.message);
    res.redirect('/login');
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      return res.redirect('/users/home');
    }

    if (req.session.admin_id) {
      req.session.admin_id = null;
      req.session.admin = null;
      req.session.isAdmin = false;
    }

    res.set("Cache-Control", "no-store");
    next();
  } catch (error) {
    console.log('User logout middleware error:', error.message);
    next();
  }
};

module.exports = {
  isLogin,
  isLogout,
};
