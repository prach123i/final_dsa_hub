import express from 'express';
import Blog from '../models/blog.js'; // Adjust the path as needed
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import Comment from '../models/comment.js';
import User from '../models/user.js';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  console.log('Token:', token); // Log the token

  if (!token) {
    return res.redirect("/api/user/signin"); 
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    res.locals.user=verified;
    console.log(req.user);
    next();
  } catch (error) {
    return res.status(403).json({ msg: "Invalid token" });
  }
};


// Route to render "Add New Blog" page
router.get('/add-new',isAuthenticated, async(req, res) => {
  const user = await User.findById(req.user.userid);
  console.log(user.username);
  return res.render('blog',{user});
});


// Route to show all blogs
router.get('/show-blogs',isAuthenticated, async (req, res) => {
  try {
    // Fetch all blogs
    const user = await User.findById(req.user.userid);
    const blogs = await Blog.find().populate('createdBy');
    res.render('showblogs', { blogs,user });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to get blog details by ID
router.get('/:id',isAuthenticated, async (req, res) => {
  console.log('Blog ID:', req.params.id); // Log the blog ID being requested
  const user=req.user;
  console.log(user);

  try {
    const blog = await Blog.findById(req.params.id)
    .populate('createdBy', 'username profileImageURL')
    .populate({
      path:'comments',
      populate:{path:'createdBy', select:'username'},
    })
    if (!blog) {
      return res.status(404).send('Blog not found');
    }
    res.render('blogdetail', { blog,user });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to delete a blog by ID
router.get('/delete/:id',isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send('Blog not found');
    }
    await blog.deleteOne();
    res.redirect('/blog/show-blogs');
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).send('Error deleting blog');
  }
});

// Route to create a new blog
router.post('/', isAuthenticated, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, body } = req.body;
    console.log(req.body);
    
    // const token = req.cookies.token; // Get token from headers
    // const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    const userId = req.user.userid; // Extract user ID from the token
    console.log(userId);

    const newBlog = await Blog.create({
      title,
      body,
      coverImageURL: `/uploads/${req.file.filename}`,
      createdBy: userId, // Assuming `req.user` contains the logged-in user's info
    });

    // await newBlog.save();
    console.log(newBlog);
    const allBlogs = await Blog.find({ createdBy: req.user.userid });

    // Pass user object and the new blog to the profile page
    res.redirect("/api/user/profile");
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).send('Internal server error');
  }
});
// Add this route to your blog router
router.post('/:id/comment', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, text } = req.body;
    console.log(req.body);
    // 1. Create a new comment in the Comment collection
    const newComment = await Comment.create({
      text,
      createdBy: req.user.userid, // Replace with the user ID if available
    });
    console.log("new : ",newComment);
    console.log("createdBy",newComment.createdBy);


    // 2. Find the blog by ID and link the comment
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    blog.comments.push(newComment._id); // Push the comment's ObjectId to the blog's comments array
    await blog.save();

    // 3. Redirect back to the blog page
    res.redirect(`/blog/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

export default router;
