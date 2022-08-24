
require("express-async-errors")
require('dotenv/config')
const migrationsRun = require('./database/sqlite/migrations');
const express = require('express');
const AppError = require('./utils/AppError')
const UploadConfig = require('./configs/upload');

const cors = require('cors');
const routes = require('./routes')

migrationsRun();

const app = express();
app.use(cors());
app.use(express.json())

app.use(routes)

app.use('/files', express.static(UploadConfig.UPLOADS_FOLDER))


app.use((error, req, res, next)=>{
    if( error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: "error",
            message: error.message
        })
    }

    console.log(error)

    return res.status(500).json({
        status: "error",
        message: "Internal server error"
    })
}) 

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`)
});