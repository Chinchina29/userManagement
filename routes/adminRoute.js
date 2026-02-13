const express = require("express");
const admin_route = express.Router();
const { isLogin, isLogout } = require('../middleware/adminAuth');

const { loginLoad, verifyLogin, loadDashboard, adminLogout, adminDashboard, newUserLoad, addUser, editUser, updateUser, deleteUser, validateSession,blockUser,unblockUser } = require("../controllers/adminController");



admin_route.get('/', isLogout, loginLoad)
admin_route.post('/', verifyLogin)
admin_route.get('/home', isLogin, loadDashboard);
admin_route.get('/logout', isLogin, adminLogout);
admin_route.get('/dashboard', isLogin, adminDashboard)
admin_route.get('/new-user', isLogin, newUserLoad)
admin_route.post('/new-user', addUser)
admin_route.get('/edit-user', isLogin, editUser)
admin_route.post('/edit-user', updateUser)
admin_route.get('/block-user/:id',isLogin,blockUser)
admin_route.get('/unblock-user/:id',isLogin,unblockUser)

admin_route.get('/delete-user', deleteUser)
admin_route.get('/validate-session', validateSession)

module.exports = admin_route;
