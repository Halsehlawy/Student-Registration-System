const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true},
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
module.exports = Class;