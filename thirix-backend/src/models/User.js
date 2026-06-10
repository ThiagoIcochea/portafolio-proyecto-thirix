const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    motherLastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    birthDate: {
      type: Date
    },

    gender: {
      type: String,
      enum: [
        "Masculino",
        "Femenino",
        "Otro",
        "Prefiero no decirlo"
      ],
      default: "Prefiero no decirlo"
    },

    profession: {
      type: String,
      default: ""
    },

    interests: [
      {
        type: String
      }
    ],

    bio: {
      type: String,
      default: ""
    },

    avatar: {
      type: String,
      default: ""
    },

    coverImage: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      default: ""
    },

    website: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      default: "Disponible"
    },

    lastSeen: {
      type: Date,
      default: Date.now
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    savedPosts: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }
]
  },

   
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);