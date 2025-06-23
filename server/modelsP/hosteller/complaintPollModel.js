const mongoose = require('mongoose');

const complaintPollSchema = new mongoose.Schema({
    complaintId: { 
        type:String, 
        ref: 'Complaint', 
        required: true 
    },
    votedBy: [{ 
        type: String, 
        ref: 'Hosteller' 
    }],
    totalVotes: { 
        type: Number, 
        default: 0 
    }
});

const ComplaintPoll = mongoose.model('ComplaintPoll', complaintPollSchema);
module.exports = ComplaintPoll;
