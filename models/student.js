const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    parent_contact: { type: String, required: true },
    address: { type: String, required: true },
    image: { type: String, default: '/assets/default-avatar.svg' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);