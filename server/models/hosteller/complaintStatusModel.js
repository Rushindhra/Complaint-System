const complaintStatusSchema = new mongoose.Schema({
    complaintId: {
        type: String,
        ref: 'Complaint',
        required: true
    },
    updatedBy: {
        type: String,
        ref: 'Hosteller', // Hosteller
        required: true
    },
    status: {
        type: String,
        enum: ['Not Done Yet', 'In Progress', 'Completed'],
        default: 'Not Done Yet'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const ComplaintStatus = mongoose.model('ComplaintStatus', complaintStatusSchema);
module.exports = ComplaintStatus;
