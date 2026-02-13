const express = require("express");
const user_route = express.Router();
const auth = require('../middleware/auth');
const checkBlocked=require('../middleware/checkBlocked')
const {
  registerUser,
  loadRegister,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
} = require('../controllers/userController');


user_route.get('/register', auth.isLogout, loadRegister);
user_route.post('/register', registerUser);
user_route.get('/login', auth.isLogout, loginLoad);
user_route.post('/login', verifyLogin);
user_route.get('/users/home', auth.isLogin,checkBlocked, loadHome);
user_route.get('/', auth.isLogout, loginLoad);
user_route.get('/logout',auth.isLogin,userLogout)




module.exports = user_route;