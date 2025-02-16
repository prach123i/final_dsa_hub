import express from "express";
import User from "../models/user.js";
import dotenv from "dotenv";
import Blog from "../models/blog.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../config/emailconfig.js";
import crypto from "crypto";

dotenv.config();
const router = express.Router();  

const isLoggedIn = (req, res, next) => {
const token = req.cookies.token;

  if (!token) {
    return res.redirect("/api/user/signin"); 
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ msg: "Invalid token" });
  }
};



router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already registered" });

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,  // ✅ Ensure default is false
    });

    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({ msg: "Signup successful. Check your email for verification." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Signin route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
// Fetch fresh data from the database before rendering
// const updatedUser = await User.findById(req.user.userid);

    if (!user) return res.status(400).json({ msg: "User not found" });

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password." });
    }

    let token = jwt.sign({ email: user.email, userid: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });

    // res.status(200).json({ msg: "Login successful", token });
    res.render('authfront', { user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params; // ✅ FIX: Use params instead of query

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    // ✅ FIX: Properly update isVerified field
    const result = await User.updateOne(
      { _id: user._id },
      { $set: { isVerified: true, verificationToken: null } }
    );

    if (result.modifiedCount === 1) {
      return res.redirect("/api/user/signin"); // ✅ Redirect to signin page
    } else {
      return res.status(500).json({ error: "Verification update failed" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// routes/user.js
router.get('/profile',isLoggedIn,async (req, res) => {
  const user = await User.findById(req.user.userid);
  console.log(user);
  
  if (!user) {
      return res.redirect('/api/user/signin');
  }
  const blogs = await Blog.find({ createdBy: user._id }); 
  // Render the profile view with the user data
  res.render('profile', { 
    user, 
    blogs, 
  });
});

router.get('/profile-edit', isLoggedIn, async (req, res) => {

  const user = await User.findById(req.user.userid);  // Using req.user for authenticated user
  if (!user) {
    return res.redirect('/api/user/signin');
  }
  const blogs = await Blog.find({ createdBy: user._id }); 
  res.render('edit-profile', { user, blogs });
});

router.post("/profile-edit",isLoggedIn, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.userid);

    if (username) user.username = username;
    if (password){
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const updatedUser = await User.findById(req.user.userid);
    console.log("updateduseer",updatedUser);
    req.session.user = updatedUser; // Update session with new data
    res.render('authfront',{user: req.session.user}); // Redirect back to the profile page
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Something went wrong");
  }
});

router.get('/front', async (req,res)=>{
  res.render('front',{user:req.user});
});

router.get('/authfront',isLoggedIn,async (req,res)=>{
  const user = await User.findById(req.user.userid);  // Using req.user for authenticated user
  res.render('authfront',{user});
})
router.get('/sheets',isLoggedIn, async (req,res)=>{
  const user = await User.findById(req.user.userid);
  if (!user) {
  return res.redirect('/api/user/signin');
}
res.render("sheets",{user});
});
// Signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});

// Signin page
router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/logout", function(req,res){
  res.cookie('token',"");
  res.redirect("/api/user/front");
})
router.get("/home",isLoggedIn,async(req,res)=>{
  const user = await User.findById(req.user.userid);
    if (!user) {
    return res.redirect('/api/user/signin');
}
  res.render("home",{user});
  console.log(user);
})
export default router;
