const mongoose = require('mongoose')


const ContentSchema = new mongoose.Schema({
    title: {
        type     : String,
        required : true
    },

    file: {
        type     : String,
        required : true
    },
    
    data: {
        type     : Array,
        required : true
    },
    
    createdAt: {
        type     : Date,
        default  : Date.now(),
        required : true
    }

}, { timestamps: true })


module.exports = mongoose.model('Content', ContentSchema)