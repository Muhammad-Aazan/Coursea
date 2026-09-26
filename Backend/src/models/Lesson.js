const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section reference is required"]
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"]
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    videoUrl: {
      type: String,
      default: ""
    },
    duration: {
      type: Number,
      default: 0
    },
    order: {
      type: Number,
      default: 0
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;
