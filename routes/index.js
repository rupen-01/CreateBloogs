const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require('../models/user');
const postModel = require('../models/post');

const upload = require('../config/multerconfig');


router.get('/', (req, res)=>{
    res.render('index')
  })
  
  router.get('/profile/uplode', (req, res)=>{
    res.render("profileuplode")
  });
  

// Files Uplodes .....
  router.post('/upload',isLoggedIn, upload.single("image"), async(req, res)=>{
   let user = await userModel.findOne({ email: req.user.email });
   user.profilepic = req.file.filename;
   await user.save()
   res.redirect("/profile")
  });
  
  
   router.get("/login", (req, res) => {
    res.render("login");
  });
  

  router.get("/profile",isLoggedIn ,async(req, res) => {
   let user = await userModel.findOne({email: req.user.email}).populate("posts");
   res.render("profile", {user});
  });
  

  //Like Posts ......
  router.get("/like/:id",isLoggedIn ,async(req, res) => {
   let post = await postModel.findOne({_id: req.params.id}).populate("user");
   if (post.like.indexOf(req.user.userid) === -1) {
    post.like.push(req.user.userid)
   }
  else{
    post.likes.splice(req.user.indexOf(req.user.userid), 1);
  }
   await post.save()
    res.redirect("/profile");
  });
  

  router.post("/post", isLoggedIn, async (req, res) => {
    try {
      const { content } = req.body; 
      const user = await userModel.findOne({ email: req.user.email }); 
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const post = await postModel.create({ user: user._id, content });
      user.posts.push(post._id);
      await user.save();
      res.redirect('/profile');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  
  //User Register ......... 
  router.post("/register", async (req, res) => {
    const { username, name, age, email, password } = req.body;
    try {
      // Check if user already exists
      const user = await userModel.findOne({ email: email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user
      const newUser = new userModel({
        username,
        name,
        age,
        email,
        password: hashedPassword,
      });
      await newUser.save();
  
      // Generate JWT token
      const token = jwt.sign({ email: email, userid: newUser._id }, "shhhhh", {
        expiresIn: "2d",
      });
  
      res.cookie("token", token);
      res.redirect("/login");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  
  //Login User .......
  router.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await userModel.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Compare hashed password
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const token = jwt.sign({ email: email, userid: user._id }, "shhhhh", {
            expiresIn: "2d",
          });
    
          res.cookie("token", token);
          
          return res.status(200).redirect("/profile");
        } else {
           res.redirect("/login");
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
      }
    });
    
  //User Logout ......
  router.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/login");
  });
  

  //Token Funcation ......
  function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") {
      res.redirect("/login");
    } else {
      let data = jwt.verify(req.cookies.token, "shhhhh");
      req.user = data;
    }
    next();
  }

  
  module.exports = router;