const mongoose = require('mongoose');

const listComplaintSchema = new mongoose.Schema({
    totalComplaints: Number,
    totalResolved: Number,
    totalPending: Number,
    totalVerified: Number,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const ListComplaint = mongoose.model('ListComplaint', listComplaintSchema);
module.exports = ListComplaint;
