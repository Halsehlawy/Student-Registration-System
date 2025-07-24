const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], required: true },
    linkedInstructor: {
        type: Schema.Types.ObjectId,
        ref: 'Instructor'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);