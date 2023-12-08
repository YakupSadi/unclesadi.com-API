const express = require('express')
const app = express()

app.use(express.json())
require('dotenv').config()

// Port
const port = process.env.PORT || 4000

// Db
const connectDB = require('./db/connect')

// Cors
const cors = require('cors')
app.use(cors())

// Cookie
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// Middleware
const errorHandler = require('./middleware/error')
app.use(errorHandler)

// Uploads
app.use(express.static('public/uploads'))


// Routers
const Admin = require('./routers/admin')
app.use('/api/v1/', Admin)

const Folder = require('./routers/folder')
app.use('/api/v1/', Folder)

const File = require('./routers/file')
app.use('/api/v1/', File)

const Content = require('./routers/content')
app.use('/api/v1/', Content)


// Listen
const start = async () => {
    try 
    {
        await connectDB(process.env.MONGO_URL)
        app.listen(port, () => console.log(` Server is listening on port: http://localhost:${port} `))
    }
    catch (err)
    {
        console.log(err)
    }
}
start()