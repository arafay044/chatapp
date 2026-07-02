import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


// Signup controller
export const signup = async(req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({ success: false , message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        // check if user already exists
        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({ success: false , message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // create new user
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio: bio || "Hey there! I'm using Pulse.",
        });
        const token = generateToken(newUser._id);
        res.json({ success: true, userData: newUser, message: "User created successfully", token });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false , message: error.message });
    }
}

// Login controller
export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ success: false , message: "All fields are required" });
        }
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.status(400).json({ success: false , message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if(!isPasswordValid) {
            return res.status(400).json({ success: false , message: "Invalid credentials" });
        }
        const token = generateToken(userData._id);
        res.json({ success: true, userData, message: "Login successful", token });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false , message: error.message });
    }
}

// controller to check is user is authenticated
export const checkAuth = async(req, res) => {
    res.json({ success: true, user: req.user });
}

// search users by name/username/email to start a new conversation
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.json({ success: true, users: [] });
        }
        const regex = new RegExp(q.trim(), "i");
        const users = await User.find({
            _id: { $ne: req.user._id },
            $or: [{ fullName: regex }, { username: regex }, { email: regex }],
        })
            .select("-password -pushSubscription")
            .limit(20);
        res.json({ success: true, users });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// controller to update user profile details
export const updateProfile = async(req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;
        if(!profilePic) {
           updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true }); ;
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }
        res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false , message: error.message });
    }
}