const mongoose = require('mongoose');

const complaintLogSchema = new mongoose.Schema({
    complaintId: { 
        type: String, 
        ref: 'Complaint',
        required: true 
    },
    action: { 
        type: String, 
        required: true 
    }, // e.g., "Created", "Assigned", "Resolved"
    actorId: { 
        type: String, 
        ref: 'Worker' 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    notes: String
});

const ComplaintLog = mongoose.model('ComplaintLog', complaintLogSchema);
module.exports = ComplaintLog;
