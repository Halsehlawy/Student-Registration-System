const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    image: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
}, { timestamps: true });

const Instructor = mongoose.model('Instructor', instructorSchema);
module.exports = Instructor;