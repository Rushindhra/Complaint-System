//may not be required
const mongoose = require('mongoose');

const workerRatingSchema = new mongoose.Schema({
    complaintId: { 
        type: String, 
        ref: 'Complaint', 
        required: true 
    },
    studentId: { 
        type: String, 
        ref: 'Hosteller', 
        required: true 
    },
    workerId: { 
        type: String, 
        ref: 'Worker', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    feedback: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const WorkerRating = mongoose.model('WorkerRating', workerRatingSchema);
module.exports = WorkerRating;
