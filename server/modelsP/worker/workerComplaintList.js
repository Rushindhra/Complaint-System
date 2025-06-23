const mongoose = require('mongoose');

const workerComplaintListSchema = new mongoose.Schema({
    workerId: { 
        type: String, 
        ref: 'Worker', 
        required: true 
    },
    category: {
         type: String, 
         required: true 
        },
    complaintIds: [{
         type: String, 
         ref: 'Complaint' 
        }],
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const WorkerComplaintList = mongoose.model('WorkerComplaintList', workerComplaintListSchema);
module.exports = WorkerComplaintList;
