import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { sendToken } from "../utils/sendToken.js";
import { uploadToCloudinary } from "../lib/cloudinaryService.js";
import compressionService from "../lib/compression.js";


export const registerUser = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  let profilePicData = { public_id: "", url: "" };

  if (req.file) {
    const compressedBuffer = await compressionService.compress(req.file.buffer);
    const result = await uploadToCloudinary(compressedBuffer, "profilePics");
    profilePicData.public_id = result.public_id;
    profilePicData.url = result.url;
  }

  const user = await User.create({
    name,
    email,
    password,
    profilePic: profilePicData,
  });

  sendToken(user, 200, res, "Register Successful");
});

// Login Verify
export const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const verifyPass = await bcrypt.compare(password, user.password);

  if (!verifyPass) {
    return next(new AppError("Email or Password doesn't match", 401));
  }
  sendToken(user, 200, res, "Login Successful");
});

// Logout User
export const logout = catchAsync(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "Logged Out",
  });
});

// Get all Users
export const allUsers = catchAsync(async (req, res, next) => {
  const { usr } = req.query;
  const filter = {};
  if (usr) filter._id = usr;
  const users = await User.find(filter).lean().sort({ updatedAt: -1 });
  res.status(200).json({
    status: "success",
    data: users,
  });
});

// Get User Detail
export const loadUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

// Update Admin Profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new AppError("User not found", 404));

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;

  if (req.file) {
    // Delete old profile pic from Cloudinary if it exists
    if (user.profilePic?.public_id && user.profilePic.public_id !== "This is sample") {
      const { deleteFromCloudinary } = await import("../lib/cloudinaryService.js");
      await deleteFromCloudinary(user.profilePic.public_id);
    }
    const compressedBuffer = await compressionService.compress(req.file.buffer);
    const result = await uploadToCloudinary(compressedBuffer, "profilePics");
    user.profilePic = { public_id: result.public_id, url: result.url };
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: user,
  });
});
