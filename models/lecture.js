const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const lectureSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
}, { timestamps: true });