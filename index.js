import express from "express";
import { connectToMongodb } from "./connection.js";
import userRouter from "./routes/user.js";
import blogRouter from "./routes/blog.js";
import path from "path";
import Blog from "./models/blog.js";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'; // Import dotenv for environment variables
import session from "express-session";
dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 8000;

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/media";
connectToMongodb(mongoUri);


// Set EJS as the view engine
app.set("view engine", "ejs");

// Middleware
app.use(express.static(path.resolve("./public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true in production with HTTPS
}));


// Route Middleware
app.use("/api/user", userRouter);
app.use("/blog", blogRouter);

app.set("views", path.resolve("./views"));

// Routes

app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({});
    res.render("signin", { blogs: allBlogs });
  } catch (err) {
    console.error("Error rendering signin template:", err);
    res.status(500).send("Error rendering signin template");
  }
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong. Please try again later.");
});

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});


// Start the server
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
