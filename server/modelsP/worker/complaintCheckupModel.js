const mongoose = require('mongoose');

const complaintCheckupSchema = new mongoose.Schema({
    complaintId: { 
        type: String,
         ref: 'Complaint', 
         required: true 
        },
    verifierId: { 
        type: String, 
        ref: 'Warden', 
        required: true 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    remarks: String,
    checkedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const ComplaintCheckup = mongoose.model('ComplaintCheckup', complaintCheckupSchema);
module.exports = ComplaintCheckup;
