const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')


const AdminSchema = new mongoose.Schema({
    email: {
        type     : String,
        required : true,
        match    : [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ],
        unique   : true
    },

    password: {
        type      : String,
        required  : true,
        minlength : 5,
    },
    
    role: {
        type    : String,
        enum    : ['admin', 'user'],
        default : 'admin'
    }
})


AdminSchema.pre('save', async function() {
    const salt    = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})


AdminSchema.methods.createJWT = function() {
    return jwt.sign({ adminId: this._id, email: this.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
}


AdminSchema.methods.comparePassword = async function(canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password)
    return isMatch
}


module.exports = mongoose.model('Admin', AdminSchema)