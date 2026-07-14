// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   role: {
//     type: String,
//     enum: ["admin", "employee"],
//     default: "employee",
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
// }, { timestamps: true });

// // ✅ IMPORTANT: "User" naam se export hona chahiye
// export default mongoose.model("User", userSchema);


// User.js - Updated model
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "employee"],
    default: "employee",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  marks: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);