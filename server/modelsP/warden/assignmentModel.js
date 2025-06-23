const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    complaintId: { 
        type: String,
         ref: 'Complaint', 
         required: true 
        },
    assignedBy: { 
        type: String, 
        ref: 'Warden', 
        required: true 
    }, // Warden
    workerId: { 
        type:String, 
        ref: 'Worker', 
        required: true 
    },   // Assigned worker
    category: { 
        type: String, 
        required: true 
    },
    assignedAt: { 
        type: Date, 
        default: Date.now
     }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
