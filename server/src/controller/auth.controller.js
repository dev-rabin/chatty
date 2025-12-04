import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    console.log("signup req.body:", req.body);
    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long!" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      newUser.save();
      console.log("New user created:", newUser);
      res
        .status(201)
        .json({ message: "User created successfully!", user: newUser });
    } else {
      res.status(400).json({ message: "Invalid user data!" });
    }
  } catch (err) {
    res.status(400).json({ message: "Failed to create user!" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    generateToken(user._id, res);
    res.status(200).json({ message: "Login successful!", user });
  } catch (err) {
    res.status(400).json({ message: "Login failed!", error: err.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "Logout successful!" });
  } catch (err) {
    console.error("Logout failed:", err);
    res.status(400).json({ message: "Logout failed!" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required!" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
      );
      res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (err) {
    res.status(400).json({ message: "Failed to update profile!", error: err.message });
  }
};


export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (err) {
      console.log("auth error : ", err);
        res.status(400).json({ message: "Authentication check failed!", error: err.message });
    }
}