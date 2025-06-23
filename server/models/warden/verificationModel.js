const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    complaintId: { 
        type: String,
         ref: 'Complaint', 
         required: true 
        },
    isLegit: { 
        type: Boolean, 
        required: true 
    },
    remarks: String,
    verifiedAt: { 
        type: Date,
        default: Date.now 
    }
});

const Verification = mongoose.model('Verification', verificationSchema);
module.exports = Verification;
