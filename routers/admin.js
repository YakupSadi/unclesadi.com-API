const express = require('express')
const Admin   = express.Router()
const auth    = require('../middleware/auth')


const { 
    login,
    logOut,
    isValid,
    getInfo,
    register,
    changeEmail,
    changePassword
} = require('../controller/admin')


Admin.route('/login').post(login)
Admin.route('/register').post(register)
Admin.route('/auth').post(auth, isValid)
Admin.route('/logout').post(auth, logOut)
Admin.route('/password').put(auth, changePassword)

Admin.route('/email')
    .get(auth, getInfo)
    .put(auth, changeEmail)


module.exports = Admin