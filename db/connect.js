const mongoose = require('mongoose')
mongoose.set("strictQuery", false)


const connectDB = (url) => {
    return mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => console.log('Connection is Success'))
        .catch((err) => console.log(err))
}


module.exports = connectDB