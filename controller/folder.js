const Folder          = require('../models/folder')
const async           = require('../middleware/asycn')
const { CustomError } = require('../middleware/custom_error')


const getAllFolder = async( async(req, res, next) => {
    const data = await Folder.find({})

    res.status(200).json({ data })
})


const createFolder = async( async(req, res, next) => {
    const { title, background } = req.body

    if(!title || !background) {
        res.status(400).json({ msg: 'Title or Background Field Cannot Be Empty' })
        return next(new CustomError('Title or Background Field Cannot Be Empty', 400))
    }

    await Folder.create({
        title      : title,
        background : background
    })

    res.status(201).json({ msg: 'Folder Created' })
})


const updateFolder = async( async(req, res, next) => {
    const { id: dataID }        = req.params
    const { title, background } = req.body

    if (!dataID) {
        res.status(400).json({ msg: 'ID Field Cannot Be Empty' })
        return next(new CustomError('ID Field Cannot Be Empty', 400))
    }

    if(!title || !background) {
        res.status(400).json({ msg: 'Title or Color Field Cannot Be Empty' })
        return next(new CustomError('Title or Color Field Cannot Be Empty', 400))
    }

    await Folder.findOneAndUpdate({ _id: dataID }, req.body, {
        new           : true,
        runValidators : true
    })

    res.status(200).json({ msg: 'Folder Updated' })
})


const deleteFolder = async( async(req, res, next) => {
    const { id: dataID } = req.params
    if (!dataID) {
        res.status(400).json({ msg: 'ID Field Cannot Be Empty' })
        return next(new CustomError('ID Field Cannot Be Empty', 400))
    }

    await Folder.findOneAndDelete({ _id: dataID })

    res.status(200).json({ msg: 'Folder Deleted' })
})


module.exports = {
    getAllFolder,
    createFolder,
    updateFolder,
    deleteFolder
}