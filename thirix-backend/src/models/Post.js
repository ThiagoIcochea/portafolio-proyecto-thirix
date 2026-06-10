const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    media: [
      {
        url: {
          type: String
        },

        type: {
          type: String,
          enum: ["image", "video"]
        }
      }
    ],

    taggedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    commentsCount: {
      type: Number,
      default: 0
    },

    sharesCount: {
      type: Number,
      default: 0
    },

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Post", postSchema);