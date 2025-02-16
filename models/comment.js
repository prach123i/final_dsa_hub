import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    // username:{
    //   type:String,
    //   required:true,
    // },
    text: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      ref: "User", // Refers to the User model
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Comment = model("Comment", commentSchema);

export default Comment;
