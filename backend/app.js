const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const fileProcessingRoutes = require("./routes/fileProcessingRoutes");
const signupLoginRoutes = require("./routes/signupLoginRoutes");
const adminRequestProcessingRoutes = require("./routes/AdminRequestProcessingRoutes");

const multer = require("multer");

const app = express();
require('dotenv').config();
const port = process.env.port || 5000;
// const mongoDBUri = process.env.ATLAS_URI;

const mongoDBUri = "mongodb://127.0.0.1:27017/file-processing";

mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
    if (error ? console.log(error) : console.log("MongoDB connected ... here:" + mongoDBUri));
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/file", fileProcessingRoutes);
app.use("/user", signupLoginRoutes);
app.use("/admin", adminRequestProcessingRoutes);

app.listen(port, () => {
    console.log("Server is starting ... here: localhost:" + port)
});