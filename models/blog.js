import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    coverImageURL: {
      type: String,
      required: false,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      // required:true,
    },
  },
  { timestamps: true }
);

const Blog = model("Blog", blogSchema);
export default Blog;
