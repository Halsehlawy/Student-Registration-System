const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    schedule: { type: String, required: true },
    instructor: { 
        type: Schema.Types.ObjectId, 
        ref: 'Instructor',
        required: true 
    },
    students: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Student' 
    }],
    room: { type: String, required: true },
    capacity: { type: Number, required: true },
    description: { type: String }
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
module.exports = Class;