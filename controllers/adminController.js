
const User = require('../models/userModel.js');
const bcrypt = require('bcrypt');

const setCacheHeaders = (res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Last-Modified', new Date().toUTCString());
};


const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = (req, res) => {
  try {
    if (req.session.admin_id) {
      return res.redirect('/admin/home');
    }
    
    if (req.session.user_id) {
      req.session.user_id = null;
      req.session.user = null;
      req.session.isUser = false;
    }
    
    setCacheHeaders(res);
    res.render('admin/login', {});
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.trim();
    password = password.trim();

    if (!email || !password) {
      return res.render('admin/login', { message: 'Email and Password are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.render('admin/login', { message: 'Invalid email format' });
    }

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.render('admin/login', { message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    
    if (passwordMatch) {
      if (userData.is_admin === 0) {
        return res.render('admin/login', { message: 'Access denied. Admin privileges required.' });
      }
      
      req.session.user_id = null;
      req.session.user = null;
      req.session.isUser = false;
      
      req.session.admin_id = userData._id;
      req.session.admin = userData.name;
      req.session.isAdmin = true;
      
      return res.redirect('/admin/home');
    } else {
      return res.render('admin/login', { message: 'Invalid email or password' });
    }

  } catch (error) {
    console.log('Admin login error:', error.message);
    res.render('admin/login', { message: 'Login failed. Please try again.' });
  }
};

const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById(req.session.admin_id);
    setCacheHeaders(res);
    res.render('admin/home', { admin: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.admin_id = null;
    req.session.admin = null;
    req.session.isAdmin = false;
    
    req.session.destroy((err) => {
      if (err) {
        console.log('Admin session destroy error:', err);
        return res.redirect('/admin/home');
      }
      
      setCacheHeaders(res);
      res.clearCookie('admin.ash');
      res.redirect('/admin');
    });
  } catch (error) {
    console.log('Admin logout error:', error.message);
    res.redirect('/admin');
  }
};

const adminDashboard = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });
    setCacheHeaders(res);
    res.render('admin/dashboard', { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const newUserLoad = async (req, res) => {
  try {
    setCacheHeaders(res);
    res.render('admin/new-user');
  } catch (error) {
    console.log(error.message);
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render('admin/new-user', {
        message: 'User with this email already exists.',
      });
    }

    const spassword = await securePassword(password);

    const user = new User({
      name,
      email,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      res.redirect('/admin/dashboard');
    } else {
      res.render('admin/new-user', { message: 'Something went wrong' });
    }
  } catch (error) {
    console.log(error.message);
    res.render('admin/new-user', { message: error.message });
  }
};

const editUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById(id);

    if (userData) {
      setCacheHeaders(res);
      res.render('admin/edit-user', { user: userData });
    } else {
      res.redirect('/admin/dashboard');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, name, email } = req.body;
    const existingUser = await User.findOne({ email, _id: { $ne: id } });

    if (existingUser) {
      const userData = await User.findById(id);
      return res.render('admin/edit-user', {
        user: userData,
        message: 'Email already exists. Please use a different email.'
      });
    }

    await User.findByIdAndUpdate(id, {
      $set: { name, email }
    });

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error.message);
  }
};
const validateSession = async (req, res) => {
  try {
    if (!req.session.admin_id) {
      return res.status(401).json({ valid: false, message: 'No admin session found' });
    }
    
    const adminUser = await User.findById(req.session.admin_id);
    if (!adminUser || adminUser.is_admin !== 1) {
      req.session.admin_id = null;
      req.session.admin = null;
      req.session.isAdmin = false;
      return res.status(401).json({ valid: false, message: 'Invalid admin credentials' });
    }
    
    res.json({ 
      valid: true, 
      admin: adminUser.name,
      adminId: adminUser._id,
      sessionType: 'admin'
    });
  } catch (error) {
    console.log('Session validation error:', error.message);
    res.status(401).json({ valid: false, message: 'Session validation failed' });
  }
};
const unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndUpdate(userId, { isBlocked: false });

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error.message);
  }
};
const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndUpdate(userId, { isBlocked: true });

    res.redirect('/admin/dashboard'); 
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loginLoad,
  verifyLogin,
  loadDashboard,
  adminLogout,
  adminDashboard,
  newUserLoad,
  addUser,
  editUser,
  updateUser,
  deleteUser,
  validateSession,
  unblockUser,
   blockUser,
   
};
