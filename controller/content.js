const fs              = require('fs')
const path            = require('path')
const Content         = require('../models/content')
const async           = require('../middleware/asycn')
const { CustomError } = require('../middleware/custom_error')


const getAllContent = async( async(req, res) => {
    const data = await Content.find().sort({ createdAt: -1 })

    res.status(200).json({ data })
})


const getContent = async( async(req, res, next) => {
    const { id: dataID } = req.params

    if (!dataID) {
        res.status(404).json({ msg: 'Data Not Founded' })
        return next(new CustomError('Data Not Founded', 404))
    }

    const data = await Content.findOne({ _id: dataID })

    res.status(200).json({ data })
})


const getSlug = async( async(req, res, next) => {
    const { id: dataTitle } = req.params

    if (!dataTitle) {
        res.status(404).json({ msg: 'Data Not Founded' })
        return next(new CustomError('Data Not Founded', 404))
    }

    const data = await Content.find({ file: dataTitle })

    res.status(200).json({ data })
})


const slugDetail = async( async(req, res, next) => {
    const { id: dataTitle } = req.params
    const { file }          = req.query

    if (!dataTitle) {
        res.status(404).json({ msg: 'Data Not Founded' })
        return next(new CustomError('Data Not Founded', 404))
    }

    if(!file) {
        res.status(404).json({ msg: 'Data Not Founded' })
        return next(new CustomError('Data Not Founded', 404))
    }

    const data = await Content.findOne({ title: dataTitle })

    res.status(200).json({ data })
})


const createContent = async( async(req, res, next) => {
    const { title, file, outputData } = req.body

    if(!title || !file) {
        res.status(400).json({ msg: 'Title or File Field Cannot Be Empty' })
        return next(new CustomError('Title or File Field Cannot Be Empty', 400))
    }

    const data   = await Content.find({ file: file })
    const titles = data.map(d => d.title)

    if(titles.includes(title)) {
        res.status(400).json({ msg: 'Title Already Declared' })
        return next(new CustomError('Title Already Declared', 400))
    } else {
        await Content.create({
            title : title,
            file  : file,
            data  : outputData.blocks
        })
    }

    res.status(201).json({ msg: 'Content Created' })
})


const editorImg = async( async(req, res, next) => {
    const image = req.file.path
    const old   = req.body

    if(!image) {
        res.status(400).json({ msg: 'Image Field Cannot Be Empty' })
        return next(new CustomError('Image Field Cannot Be Empty', 400))
    }

    if(old.oldImg !== 'undefined') {
        fs.unlink(path.join(__dirname, '../', old.oldImg.slice(34)), (err) => {
            if (err) {
                console.log(err)
            }
        })
    }

    res.status(200).json({ image })
})


const deleteImg = async( async(req, res) => {
    const del = req.body

    if(del !== 'undefined') {
        fs.unlink(path.join(__dirname, '../', del.del.slice(34)), (err) => {
            if (err) {
                console.log(err)
            }
        })
    }

    res.status(200).json({ del })
})


const updateContent = async( async(req, res, next) => {
    const { id: dataID } = req.params

    if (!dataID) {
        res.status(400).json({ msg: 'ID Field Cannot Be Empty' })
        return next(new CustomError('ID Field Cannot Be Empty', 400))
    }

    const content = {
        title : req.body.title,
        file  : req.body.file,
        data  : req.body.outputData.blocks
    }

    if(!content.title || !content.file) {
        res.status(400).json({ msg: 'Title or File Field Cannot Be Empty' })
        return next(new CustomError('Title or Background Field Cannot Be Empty', 400))
    }

    await Content.findOneAndUpdate({ _id: dataID }, content, {
        new           : true,
        runValidators : true
    })

    res.status(200).json({ msg: 'Content Updated' })
})


const deleteContent = async( async(req, res, next) => {
    const { id: dataID } = req.params

    if (!dataID) {
        res.status(400).json({ msg: 'ID Field Cannot Be Empty' })
        return next(new CustomError('ID Field Cannot Be Empty', 400))
    }

    const data = await Content.findOne({ _id: dataID })
    
    const b = data.data.filter(map => map.type === 'image')
    b.forEach(item => {
        const a = item.data.url.slice(34)
        fs.unlink(path.join(__dirname, '../', a), (err) => {
            if (err) {
                return next(new CustomError('Something Went Wrong'))
            }
        })
    })

    await Content.findOneAndDelete({ _id: dataID })

    res.status(200).json({ msg: 'Content Deleted' })
})


module.exports = {
    getSlug,
    editorImg,
    deleteImg,
    getContent,
    slugDetail,
    createContent,
    getAllContent,
    updateContent,
    deleteContent
}