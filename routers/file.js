const express         = require('express')
const File            = express.Router()
const multer          = require('multer')
const auth            = require('../middleware/auth')
const { CustomError } = require('../middleware/custom_error')


const multerLimits = multer({
    limits: 1024 * 1024 * 5,

    fileFilter: (req, file, cb) => {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new CustomError('Please Upload an Image'))
        }

        cb(null, true)
    },

    storage: multer.diskStorage({
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
        },

        destination: (req, file, cb) => {
            cb(null, 'uploads/')
        }
    })
})


const { 
    getFile,
    getAllFile,
    createFile,
    deleteFile,
    updateFile
} = require('../controller/file')


File.route('/file').get(getAllFile)
File.route('/file/uploads/:image').get(getFile)
File.route('/file/createFile').post(auth, multerLimits.single('image'), createFile)


File.route('/file/:id')
    .put(auth, multerLimits.single('image'), updateFile)
    .delete(auth, deleteFile)


module.exports = File