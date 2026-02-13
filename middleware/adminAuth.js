const User = require('../models/userModel.js');

const isLogin = async (req, res, next) => {
  try {
    setCacheHeaders(res);

    if (!req.session.admin_id) {
      return res.redirect('/admin');
    }

    const adminUser = await User.findById(req.session.admin_id);
    
    if (!adminUser || adminUser.is_admin !== 1) {
      req.session.destroy(() => {
        res.clearCookie('admin.ash');
        return res.redirect('/admin');
      });
      return;
    }

    if (req.session.user_id) {
      req.session.user_id = null;
      req.session.user = null;
      req.session.isUser = false;
    }

    next();
  } catch (error) {
    console.log('Admin auth middleware error:', error.message);
    res.redirect('/admin');
  }
};

const isLogout = async (req, res, next) => {
  try {
    setCacheHeaders(res);

    if (req.session.admin_id) {
      return res.redirect('/admin/home');
    }

    if (req.session.user_id) {
      req.session.user_id = null;
      req.session.user = null;
      req.session.isUser = false;
    }

    next();
  } catch (error) {
    console.log('Admin logout middleware error:', error.message);
    next();
  }
};

const setCacheHeaders = (res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Last-Modified', new Date().toUTCString());
};

module.exports = {
  isLogin,
  isLogout
};
