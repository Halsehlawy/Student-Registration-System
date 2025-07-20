const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    id : {type: Number, required: true, unique: true},
    name: {type: String, required: true},
    image: {type: String, required: true},
    parent_contact: {type: String, required: true},
    address: {type: String, required: true},
},{timestamps: true});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;