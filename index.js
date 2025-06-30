import express from "express";
import { connectToMongodb } from "./connection.js";
import userRouter from "./routes/user.js";
import blogRouter from "./routes/blog.js";
import path from "path";
import Blog from "./models/blog.js";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'; // Import dotenv for environment variables
import session from "express-session";
import MongoStore from "connect-mongo";
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
  cookie: { secure: false }, // set to true in production with HTTPS
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI, // Use your MongoDB connection string
    collectionName: 'sessions'
  })
}));

// Middleware to check if user is authenticated
function checkAuthentication(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/api/user/authfront');
  }
}

// Set res.locals.user for all views (must be before routes)
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Route Middleware
app.use("/api/user", userRouter);
app.use("/blog", blogRouter);

app.set("views", path.resolve("./views"));

// Routes
app.get("/", (req, res) => {
  res.redirect("/api/user/authfront");
});


app.get("/api/user/home", checkAuthentication, (req, res) => {
  res.render("home");
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong. Please try again later.");
});

// Start the server
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
