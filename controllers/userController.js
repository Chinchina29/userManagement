const bcrypt = require('bcrypt');
const User = require('../models/userModel.js');

const setBasicCacheHeaders = (res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
};

const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error.message);
    throw error
  }
};


const loadRegister = async (req, res) => {
  try {
    if (req.session.user_id) {
      return res.redirect('/users/home');
    }
    
    if (req.session.admin_id) {
      req.session.admin_id = null;
      req.session.admin = false;
    }
    
    setBasicCacheHeaders(res);
    res.render('users/registration');
  } catch (error) {
    console.log(error.message);
  }
};

const registerUser = async (req, res) => {
  try {
    let { name, email, password, confirm_password } = req.body;

    name = name.trim();
    email = email.trim();

    if (!name || !email || !password || !confirm_password) {
      return res.render('users/registration', { message: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.render('users/registration', { message: "Password does not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('users/registration', { message: "User already exists" });
    }

    const spassword = await securePassword(password);

    const user = new User({
      name,
      email,
      password: spassword,
      is_admin: 0,
    });
    
    const userData = await user.save();

    req.session.admin_id = null;
    req.session.admin = false;
    req.session.user = name;
    req.session.success = "Your registration was successful. You can now log in.";
    
    res.redirect('/login');

  } catch (error) {
    console.log("Register Error:", error);
    res.render('users/registration', { message: error.message || "Your registration has failed." });
  }
};



const loginLoad = async (req, res) => {
  try {
    if (req.session.user_id) {
      return res.redirect('/users/home');
    }

    if (req.session.admin_id) {
      req.session.admin_id = null;
      req.session.admin = false;
    }

    const message = req.session.success || req.session.error || null;
    const messageType = req.session.success ? 'success' : 'error';
    req.session.success = null;
    req.session.error = null;

    setBasicCacheHeaders(res);
    
    if (message) {
      res.render('users/login', { message, messageType });
    } else {
      res.render('users/login', {});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      req.session.error = "All fields are required";
      return res.redirect('/login');
    }

    const userData = await User.findOne({ email });
    
    if (!userData) {
      req.session.error = "Invalid email or password";
      return res.redirect('/login');
    }

    if (userData.isBlocked) {
      req.session.error = "Your account has been blocked. Please contact administrator.";
      return res.redirect('/login');
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (passwordMatch) {
      req.session.admin_id = null;
      req.session.admin = false;
      
      req.session.user_id = userData._id;
      req.session.user = userData.name;
      req.session.isUser = true;
      
      return res.redirect('/users/home');
    } else {
      req.session.error = "Invalid email or password";
      return res.redirect('/login');
    }

  } catch (error) {
    console.log(error.message);
    req.session.error = "Login failed. Please try again.";
    return res.redirect('/login');
  }
};

const loadHome = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);

     if (!userData || userData.isBlocked) {
      return req.session.destroy(() => {
        return res.redirect('/login');
      });
    }

    setBasicCacheHeaders(res);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.render('users/home', { user: userData });

  } catch (error) {
    console.log(error.message);
    return res.redirect('/users/login');
  }
};





const userLogout = async (req, res) => {
  try {
    req.session.user_id = null;
    req.session.user = null;
    req.session.isUser = false;
    
    req.session.destroy(err => {
      if (err) {
        console.log('Session destroy error:', err);
        return res.redirect('/users/home');
      }
      
      res.clearCookie('user.ash');
      res.redirect('/');
    });
  } catch (error) {
    console.log(error.message);
    res.redirect('/');
  }
};


module.exports = {
  registerUser,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  loadRegister,
};
