import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


// Signup controller
export const signup = async(req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if(!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false , message: "All fields are required" });
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
            bio
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