// import mongoose from "mongoose";

// const taskSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     default: "",
//   },
//   basicWork: {
//     type: Boolean,
//     default: false,
//   },
//   completed: {
//     type: Boolean,
//     default: false,
//   },
//   tested: {
//     type: Boolean,
//     default: false,
//   },
//   obtainedMarks: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 100,
//   },
//   client: {
//     type: String,
//     default: "",
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   startDate: {
//     type: Date,
//   },
//   endDate: {
//     type: Date,
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "In Progress", "Completed"],
//     default: "Pending",
//   },
// }, { timestamps: true });

// const projectSchema = new mongoose.Schema({
//   projectName: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     default: "",
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "In Progress", "Completed"],
//     default: "Pending",
//   },
//   client: {
//     type: String,
//     default: "",
//   },
//   startDate: {
//     type: Date,
//   },
//   endDate: {
//     type: Date,
//   },
//   tasks: [taskSchema],
//   documents: [
//     {
//       fileName: String,
//       fileUrl: String,
//       publicId: String,
//     },
//   ],
// }, { timestamps: true });

// export default mongoose.model("Project", projectSchema);


import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  basicWork: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  tested: {
    type: Boolean,
    default: false,
  },
  obtainedMarks: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  client: {
    type: String,
    default: "",
  },
  // Single user (backward compatibility)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Multiple users
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  client: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  tasks: [taskSchema],
  documents: [
    {
      fileName: String,
      fileUrl: String,
      publicId: String,
    },
  ],
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);