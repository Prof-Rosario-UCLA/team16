import mongoose from 'mongoose';

const { Schema } = mongoose;

const testSchema = new Schema({
    name: {
        type: String,
        required: true
    },
}, { timestamps: true })

export const Test = mongoose.model('Test', testSchema, 'test')
