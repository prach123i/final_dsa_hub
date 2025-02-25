import mongoose from "mongoose";

async function connectToMongodb(url) {
  try {
    await mongoose.connect(url); // Remove outdated options
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

export { connectToMongodb };
