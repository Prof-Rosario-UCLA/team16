import dotenv from 'dotenv';
dotenv.config()
const mongoose = require('mongoose');

// connect to db
export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to mongodb");
        return true;
    }
    catch(error: any) {
        console.log(error);
        return false;
    }
}
