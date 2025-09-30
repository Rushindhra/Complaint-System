const exp = require('express')
const wardenApp = exp.Router()
const expressAsyncHandler = require('express-async-handler')
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import models
const Warden = require('../models/warden/wardenModel')
const Verification = require('../models/warden/verificationModel')
const Complaint = require('../models/complaintModel');
const Hosteller = require('../models/hosteller/hostellerModel')
const Notification = require('../models/warden/notificationModel')
const ComplaintStatusModel = require('../models/hosteller/complaintStatusModel')

// JWT verification middleware
const verifyJWT = require('../middleware/verifytoken')

wardenApp.use(exp.json())

// FIXED: Register endpoint
wardenApp.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const newUser = req.body;
    console.log("Register request received:", newUser);

    // Check if user exists
    const userExists = await Warden.findOne({ email: newUser.email });
    if (userExists) {
      return res.status(409).send({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(newUser.password, 10);
    newUser.password = hashedPassword;
    
    // Ensure role is set
    newUser.role = 'warden';

    const dbRes = await Warden.create(newUser);
    console.log("Warden registered:", dbRes);

    res.status(201).send({ 
      message: "Warden registered successfully", 
      payload: {
        Id: dbRes._id,
        firstName: dbRes.firstName,
        lastName: dbRes.lastName,
        email: dbRes.email,
        role: dbRes.role,
        phone: dbRes.phone,
        employeeId: dbRes.employeeId,
        department: dbRes.department,
        hostelBlock: dbRes.hostelBlock,
        experience: dbRes.experience
      }
    });
  })
);

// FIXED: Login endpoint
wardenApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log("Warden login attempt:", email);

    const user = await Warden.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "Invalid email" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    console.log("Warden login successful, token generated");

    res.status(200).send({ 
      message: "Login successful", 
      token, 
      payload: {
        Id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        employeeId: user.employeeId,
        department: user.department,
        hostelBlock: user.hostelBlock,
        experience: user.experience
      }
    });
  })
);

// FIXED: Get warden profile
wardenApp.get(
  "/profile/:wardenId",
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const wardenId = req.params.wardenId;

    const warden = await Warden.findById(wardenId).select('-password');
    if (!warden) {
      return res.status(404).send({ message: "Warden profile not found" });
    }

    res.status(200).send({
      message: "Warden profile fetched successfully",
      payload: {
        Id: warden._id,
        firstName: warden.firstName,
        lastName: warden.lastName,
        email: warden.email,
        role: warden.role,
        phone: warden.phone,
        employeeId: warden.employeeId,
        department: warden.department,
        hostelBlock: warden.hostelBlock,
        experience: warden.experience,
        profileImage: warden.profileImageUrl
      }
    });
  })
);

// FIXED: Update warden profile
wardenApp.put(
  "/profile/update/:wardenId",
  verifyJWT, 
  expressAsyncHandler(async (req, res) => {
    const wardenId = req.params.wardenId;
    const updatedData = { ...req.body };

    // Remove fields that should NOT be updated
    delete updatedData.role;
    delete updatedData.Id;
    delete updatedData.email;
    delete updatedData.password;

    const updatedProfile = await Warden.findByIdAndUpdate(
      wardenId,
      updatedData,
      { new: true }
    ).select('-password');

    if (!updatedProfile) {
      return res.status(404).send({ message: "Warden profile not found" });
    }

    res.status(200).send({
      message: "Profile updated successfully",
      payload: {
        Id: updatedProfile._id,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        role: updatedProfile.role,
        phone: updatedProfile.phone,
        employeeId: updatedProfile.employeeId,
        department: updatedProfile.department,
        hostelBlock: updatedProfile.hostelBlock,
        experience: updatedProfile.experience
      }
    });
  })
);

// FIXED: Delete warden profile
wardenApp.delete(
  "/profile/delete/:wardenId", 
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const wardenId = req.params.wardenId;

    const deletedProfile = await Warden.findByIdAndDelete(wardenId);

    if (!deletedProfile) {
      return res.status(404).send({ message: "Profile not found for deletion" });
    }

    res.status(200).send({ 
      message: "Profile deleted successfully", 
      payload: deletedProfile 
    });
  })
);

// FIXED: Get all complaints for warden dashboard
wardenApp.get(
  "/complaints/all",
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.status(200).send({
      message: "All complaints fetched successfully",
      payload: complaints
    });
  })
);

// FIXED: Get recent activity
wardenApp.get(
  "/complaints/recent",
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const recentComplaints = await Complaint.find()
      .sort({ updatedAt: -1 })
      .limit(10);

    res.status(200).send({
      message: "Recent activity fetched successfully",
      payload: recentComplaints
    });
  })
);

// FIXED: Update complaint status with proper endpoint
wardenApp.put(
  "/complaints/:complaintId/update",
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const { complaintId } = req.params;
    const { status, wardenId, wardenName, wardenComments, estimatedResolution } = req.body;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        status,
        wardenId,
        wardenName,
        wardenComments,
        estimatedResolution,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).send({ message: "Complaint not found" });
    }

    res.status(200).send({
      message: "Complaint updated successfully",
      payload: updatedComplaint
    });
  })
);

// FIXED: Verify complaint endpoint (corrected URL)
wardenApp.put(
  "/warden/verify/:complaintId",
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const { complaintId } = req.params;
    const { status, wardenId, wardenName, wardenComments } = req.body;

    // Find and update complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).send({ message: 'Complaint not found' });
    }

    // Update complaint
    complaint.status = status;
    complaint.wardenId = wardenId;
    complaint.wardenName = wardenName;
    complaint.wardenComments = wardenComments;
    complaint.updatedAt = new Date();
    await complaint.save();

    // Create verification record
    const verification = await Verification.create({
      complaintId,
      isLegit: status === 'Verified',
      remarks: wardenComments
    });

    res.status(200).send({
      message: 'Complaint verification updated',
      payload: complaint
    });
  })
);

// FIXED: Send notification endpoint
wardenApp.post(
  '/notify', 
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const { 
      senderId, 
      senderName, 
      senderRole, 
      recipientId, 
      recipientEmail, 
      title, 
      message, 
      type, 
      priority, 
      relatedComplaintId 
    } = req.body;

    // Basic validation
    if (!title || !message) {
      return res.status(400).send({ message: 'Title and message are required' });
    }

    // Create notification
    const notification = await Notification.create({
      title,
      description: message,
      receiverId: recipientId || null,
      complaintId: relatedComplaintId || null
    });

    res.status(200).send({ 
      message: 'Notification sent successfully', 
      payload: notification 
    });
  })
);

// Get complaint statistics
wardenApp.get(
  "/complaints/stats",
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ 
      $or: [{ status: 'Pending' }, { status: { $exists: false } }] 
    });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const completedComplaints = await Complaint.countDocuments({ status: 'Completed' });
    const verifiedComplaints = await Complaint.countDocuments({ status: 'Verified' });
    const rejectedComplaints = await Complaint.countDocuments({ status: 'Rejected' });

    res.status(200).send({
      message: "Complaint statistics fetched successfully",
      payload: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        completed: completedComplaints,
        verified: verifiedComplaints,
        rejected: rejectedComplaints
      }
    });
  })
);

// Get complaint statuses by status
wardenApp.get(
  "/statuses/:status",
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const { status } = req.params;

    const validStatuses = ["Pending", "In Progress", "Completed", "Verified", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({ message: "Invalid status value" });
    }

    const complaints = await Complaint.find({ status }).sort({ updatedAt: -1 });

    res.send({ 
      message: `Complaints with status: ${status}`, 
      payload: complaints 
    });
  })
);

module.exports = wardenApp;