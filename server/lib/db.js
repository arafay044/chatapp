import mongoose from "mongoose";

// Funciton to connect to MongoDB
export const connectDb = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Database Connected!');
        })
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    } catch (error) {
        console.log(error);
    }
}

