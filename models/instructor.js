const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    image: { type: String, default: '/assets/default-avatar.svg' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Instructor', instructorSchema);