const bcrypt          = require('bcryptjs')
const jwt             = require('jsonwebtoken')
const Admin           = require('../models/admin')
const { CustomError } = require('../middleware/custom_error.js')


const register = async (req, res, next) => {
    const { email, password } = req.body

    if(!email || !password) {
        res.status(400).json({ msg: 'Email or Password Field Cannot Be Empty' })
        return next(new CustomError('Email or Password Field Cannot Be Empty', 400))
    }

    const emailAlreadyExist = await Admin.findOne({ email })
    if(emailAlreadyExist) {
        res.status(400).json({ msg: 'Email Already Exist' })
        return next(new CustomError('Email Already Exits', 400))
    }

    const admin = await Admin.create({ email, password })
    const token = admin.createJWT()

    const time = 1000 * 60 * 60 * 24 * 30
    res.cookie('token', token, {
        httpOnly : true,
        expires  : new Date(Date.now() + time)
    })

    res.status(201).json({
        admin: {
            email: admin.email
        },
        token
    })
}


const login = async (req, res, next) => {
    const { email, password } = req.body
    if(!email || !password) {
        res.status(400).json({ msg: 'Email or Password Field Cannot Be Empty' })
        return next(new CustomError('Email or Password Field Cannot Be Empty', 400))
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
        res.status(404).json({ msg: 'User Not Found' })
        return next(new CustomError('User Not Found', 404))
    }

    const isPasswordCorrect = await admin.comparePassword(password)
    if(!isPasswordCorrect) {
        res.status(403).json({ msg: 'Password is Wrong' })
        return next(new CustomError('Password is Wrong', 403))
    }

    const token = admin.createJWT()

    const time = 1000 * 60 * 60 * 24 * 30
    res.cookie('token', token, {
        httpOnly : true,
        expires  : new Date(Date.now() + time) 
    })

    res.status(200).json({
        admin: {
            email: admin.email
        },
        token
    })
}


const getInfo = async (req, res, next) => {
    let token
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1]
    }

    if (!token) {
        res.status(401).json({ msg: 'Token Not Found' })
        return next(new CustomError('Token Not Found', 401))
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const info    = payload.email

    res.status(200).json({ info })
}


const changeEmail = async( req, res, next) => {
    let token
    const { new_email } = req.body
    const authHeader    = req.headers.authorization

    if(!new_email) {
        res.status(400).json({ msg: 'Email Field Cannot Be Empty' })
        return next(new CustomError('Email Field Cannot Be Empty', 400))
    }

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1]
    }

    if (!token) {
        res.status(401).json({ msg: 'Token Not Found' })
        return next(new CustomError('Token Not Found', 401)) 
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const email   = payload.email

    if(new_email === email) {
        res.status(401).json({ msg: 'Your New Email Cannot Be The Same as Your Old Email' })
        return next(new CustomError('Your New Email Cannot Be The Same as Your Old Email', 401))
    }

    //Check Email
    const admin = await Admin.findOne({ email })
    if(!admin) {
        res.status(404).json({ msg: 'User Not Found' })
        return next(new CustomError('User Not Found', 404))
    }

    const emailAlreadyExist = await Admin.findOne({ new_email })
    if(emailAlreadyExist) {
        res.status(400).json({ msg: 'Email Already Exist' })
        return next(new CustomError('Email Already Exits', 400))
    }

    // Update Password
    await Admin.findOneAndUpdate({ email: email }, {
        new   : true,
        email : new_email,
        runValidators: true
    })

    // Return
    res.cookie('token', 'logOut', {
        httpOnly : true,
        expires  : new Date(Date.now())
    })

    res.status(200).json({ msg: 'Email Changed' })
}


const changePassword = async( req, res, next) => {
    let token
    const { old_pass, new_pass } = req.body
    const authHeader             = req.headers.authorization

    if(!old_pass || !new_pass) {
        res.status(400).json({ msg: 'Password Field Cannot Be Empty' })
        return next(new CustomError('Password Field Cannot Be Empty', 400))
    }

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1]
    }

    if (!token) {
        res.status(401).json({ msg: 'Token Not Found' })
        return next(new CustomError('Token Not Found', 401))
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const email   = payload.email

    //Check Email
    const admin = await Admin.findOne({ email })
    if(!admin) {
        res.status(404).json({ msg: 'User Not Found' })
        return next(new CustomError('User Not Found', 404))
    }

    //Check Password
    const isPasswordCorrect = await admin.comparePassword(old_pass)
    if(!isPasswordCorrect) {
        res.status(403).json({ msg: 'Password is Wrong' })
        return next(new CustomError('Password is Wrong', 403))
    }

    // Create New Password
    const salt     = await bcrypt.genSalt(10)
    const password = await bcrypt.hash(req.body.new_pass, salt)

    // Update Password
    await Admin.findOneAndUpdate({ email: email }, {
        new      : true,
        password : password,
        runValidators: true
    })

    // Return
    res.cookie('token', 'logOut', {
        httpOnly : true,
        expires  : new Date(Date.now())
    })

    res.status(200).json({ msg: 'Password Changed' })
}


const logOut = async (req, res, next) => {
    res.cookie('token', 'logOut', {
        httpOnly : true,
        expires  : new Date(Date.now())
    })

    res.status(200).json({ msg: 'Admin Logged Out' })
}


const isValid = async (req, res) => {
    res.json({ message: 'Token is Valid' })
}


module.exports = {
    login,
    logOut,
    getInfo,
    isValid,
    register,
    changeEmail,
    changePassword
}