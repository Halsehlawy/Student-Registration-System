const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    contact: { type: String },
    address: { type: String },
    // relationship to user
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Instructor = mongoose.model('Instructor', instructorSchema);
module.exports = Instructor;