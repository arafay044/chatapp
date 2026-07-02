import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "Hey there! I'm using Pulse.",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    pushSubscription: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

export default User;