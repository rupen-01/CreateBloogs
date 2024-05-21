const express = require("express");
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const postModel = require("./models/post");
const userRouter = require('./routes/index');

const crypto = require('crypto');
const path = require('path');


const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

app.use('/', userRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
