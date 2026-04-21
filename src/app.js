
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");


const userRoute = require('../routes/userRoute');
const authRoute = require('../routes/authRoute');
const productRoute = require('../routes/productRoute');
const { sanitizeResponse } = require("../middlewares/sanitizeResponse");


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// conecting to database
dotenv.config({ path: "./config/config.env" });

const connectDatabase = () => {
    const PASS = process.env.DATABASE_PASSWORD;
    const DB = process.env.DATABASE.replace('<db_password>',PASS);

    mongoose
        .connect(DB)
        .then(con => {
            console.log(`MongoDB Database connected with Name: ${con.connection.name}`);
        })
        .catch(err => {
            console.log(`Database connection error: ${err.message}`);
            process.exit(1);
        })
};

connectDatabase();

//this middleware to hide sensitive info in res logs
app.use (sanitizeResponse)

// Routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/products', productRoute);

// 404 handler - catch-all
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});


module.exports = app;
