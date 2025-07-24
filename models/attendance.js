const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
    class: { 
        type: Schema.Types.ObjectId, 
        ref: 'Class',
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    records: [{
        student: { 
            type: Schema.Types.ObjectId, 
            ref: 'Student',
            required: true 
        },
        status: { 
            type: String, 
            enum: ['present', 'absent', 'late', 'excused'],
            default: 'absent'
        },
        notes: { 
            type: String 
        }
    }]
}, { timestamps: true });

// Compound index to ensure one attendance record per class per date
attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;