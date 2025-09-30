const mongoose = require("mongoose");

const complaintStatusSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  updatedBy:   {
    type: String,               // roll-number or "warden"
    required: true
  },
  status: {
    type: String,
    enum: ['Not Started','In Progress','Completed','Verified','Rejected'],
    default: 'Not Started'
  },
  updatedAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model("ComplaintStatus", complaintStatusSchema);