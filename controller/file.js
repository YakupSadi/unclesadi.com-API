const fs              = require('fs')
const path            = require('path')
const File            = require('../models/file')
const async           = require('../middleware/asycn')
const { CustomError } = require('../middleware/custom_error')


const getAllFile = async( async(req, res) => {
    const data = await File.find({})

    res.status(200).json({ data })
})


const getFile = async( async(req, res, next) => {
    const image = req.params.image

    if(!image) {
        res.status(404).json({ msg: 'Image Not Found' })
        return next(new CustomError('Image Not Found', 404))
    }

    res.sendFile(path.join(__dirname, '../uploads', image))
})


const createFile = async( async(req, res, next) => {
    const { title, folder } = req.body
    const image             = req.file.path

    if(!title || !folder || !image) {
        fs.unlink(path.join(__dirname, '../', image), (err) => {
            if (err) {
                console.log(err)
            }
        })

        res.status(400).json({ msg: 'Title or Folder Field Cannot Be Empty' })
        return next(new CustomError('Title or Folder Field Cannot Be Empty', 400))
    }

    const file = new File({ title, folder, image })
    await file.save()

    res.status(201).json({ msg: 'File Created' })
})


const updateFile = async( async(req, res, next) => {
    const { title, folder, old } = req.body
    const { id: dataID }         = req.params
    const image                  = a = req.file ? req.file.path : old

    if (!dataID) {
        res.status(400).json({ msg: 'ID Field Cannot Be Empty' })
        return next(new CustomError('ID Field Cannot Be Empty', 400))
    }

    if(!title || !folder || !image) {
        fs.unlink(path.join(__dirname, '../', image), (err) => {
            if (err) {
                console.log(err)
            }
        })

        res.status(400).json({ msg: 'Title or Folder Field Cannot Be Empty' })
        return next(new CustomError('Title or Folder Field Cannot Be Empty', 400))
    }

    await File.findOneAndUpdate({ _id: dataID }, {
        new    : true,
        title  : title,
        folder : folder,
        image  : image,
        runValidators: true
    })

    if(old !== image) {
        fs.unlink(path.join(__dirname, '../', old), (err) => {
            if (err) {
                console.log(err)
            }
        })
    }

    res.status(200).json({ msg: 'File Updated' })
})


const deleteFile = async( async(req, res, next) => {
    const { image }      = req.body
    const { id: dataID } = req.params

    if (!dataID) {
        res.status(400).json({ msg: 'ID Field Cannot Be Empty' })
        return next(new CustomError('ID Field Cannot Be Empty', 400))
    }

    if(!image) {
        res.status(400).json({ msg: 'Image Field Cannot Be Empty' })
        return next(new CustomError('Image Field Cannot Be Empty', 400))
    }

    fs.unlink(path.join(__dirname, '../', image), (err) => {
        if (err) {
            return next(new CustomError('Something Went Wrong'))
        }
    })

    await File.findOneAndDelete({ _id: dataID })

    res.status(200).json({ msg: 'File Deleted' })
})


module.exports = {
    getFile,
    getAllFile,
    createFile,
    deleteFile,
    updateFile
}