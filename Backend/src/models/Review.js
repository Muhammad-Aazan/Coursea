const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"]
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"]
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"]
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// One review per student per course
reviewSchema.index({ student: 1, course: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
