const exp=require('express')
const wardenApp=exp.Router()
const expressAsyncHandler=require('express-async-handler')
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

//to import the warden model
const Warden=require('../models/warden/wardenModel')

// to import verification model
const Verification=require('../models/warden/verificationModel')

//to import complaints
const Complaint=require('../models/complaintModel');

//to import hostellers
const Hosteller=require('../models/hosteller/hostellerModel')

//verification of jwt
const verifyJWT=require('../middleware/verifytoken')

//to import notification model
const Notification=require('../models/warden/notificationModel')

//to import complaint status model
const ComplaintStatusModel=require('../models/hosteller/complaintStatusModel')

wardenApp.use(exp.json())

//to verify the complaint givn by the student
wardenApp.put(
  '/warden/verify',
  verifyJWT,                               // checks token & role
  expressAsyncHandler(async (req, res) => {
    const { complaintId, isLegit, remarks } = req.body;

    // 1. Ensure complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).send({ error: 'Complaint not found' });
    }

    // 2. Save verification record
    const verification = await Verification.create({
      complaintId,
      isLegit,
      remarks
    });

    // 3. Update complaint status
    complaint.status = isLegit ? 'verified' : 'rejected';
    await complaint.save();

    res.status(200).send({
      message: 'Complaint verification updated',
      verification
    });
  })
);

//to send the notification to the student
wardenApp.post('/warden/notify', verifyJWT,expressAsyncHandler(async (req, res) => {
  try {
    const { title, description, receiverId, complaintId } = req.body;

    // basic validation
    if (!title || !description)
      return res.status(400).send({ error: 'title & description are required' });

    let targetUserId = null;  // null = broadcast

    // CASE A: explicit receiverId
    if (receiverId) {
      const user = await Hosteller.findById(receiverId);
      if (!user || user.role !== 'hosteller')
        return res.status(404).send({ error: 'Hosteller not found' });
      targetUserId = receiverId;
    }

    // CASE B: infer student from complaintId
    if (complaintId && !receiverId) {
      const complaint = await Complaint.findById(complaintId);
      if (!complaint)
        return res.status(404).send({ error: 'Complaint not found' });
      targetUserId = complaint.studentId;          // field name from your Complaint model
    }

    // build & save
    const notif = new Notification({
      title,
      description,
      receiverId: targetUserId,     // null ➜ broadcast
      complaintId: complaintId || null
    });

    await notif.save();
    res.status(200).send({ message: 'Notification queued', notification: notif });

  } catch (err) {
    console.error('Notification error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
}));

// 🔑 POST - Register (Signup) a new student/hosteller
wardenApp.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const newUser = req.body;
    console.log("Register request received:", newUser);

    const userExists = await Warden.findOne({ email: newUser.email });
    if (userExists) {
      return res.status(409).send({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(newUser.password, 10);
    newUser.password = hashedPassword;

    const dbRes = await Warden.create(newUser);
    console.log("User registered:", dbRes);

    res.status(201).send({ message: "User registered successfully", payload: dbRes });
  })
);


//post-login a studnet/hosteller
wardenApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    const user = await Warden.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "Invalid email" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("Login successful, token generated");

    res.status(200).send({ message: "Login successful", token, payload: user });
  })
);

//edit their profile
wardenApp.put("/editprofile/:wardenId",verifyJWT, expressAsyncHandler(async (req, res) => {
  const wardenId = req.params.wardenId;
  const updatedData = { ...req.body };

  // ❌ Remove fields that should NOT be updated
  delete updatedData.role;
  delete updatedData.Id;
  delete updatedData.email;
  //delete fileds should be handled correctly during frontened implementation

  const updatedProfile = await Warden.findOneAndUpdate(
    {Id:wardenId},
    updatedData,
    { new: true }
  );

  if (!updatedProfile) {
    return res.status(404).send({ message: "Profile not found" });
  }

  res.status(200).send({
    message: "Profile updated successfully",
    payload: updatedProfile,
  });
}));


//delete their profile/account
wardenApp.delete("/deleteprofwardenudentId", verifyJWT,expressAsyncHandler(async (req, res) => {
  const wardenId = req.params.wardenId;

  const deletedProfile = await Warden.findOneAndDelete({ Id: wardenId });

  if (!deletedProfile) {
    return res.status(404).send({ message: "Profile not found for deletion" });
  }

  res.status(200).send({ message: "Profile deleted successfully", payload: deletedProfile });
}));

//to display all complaint
wardenApp.get(
  "/complaints/all",             // better REST path
  verifyJWT,         // restrict to warden/admin
  expressAsyncHandler(async (req, res) => {
    const complaints = await Complaint.find().sort({ createdAt: -1 }); // latest first

    if (!complaints.length) {
      return res.status(404).send({ message: "No complaints found" });
    }

    res.status(200).send({
      message: "All complaints fetched successfully",
      payload: complaints
    });
  })
);

///to get the complaintStatus by status

wardenApp.get(
  "/statuses/:status",
  verifyJWT,
  expressAsyncHandler(async (req, res) => {
    const { status } = req.params;

    // Validate status
    const validStatuses = ["In Progress", "Completed", "Not yet started"];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({ message: "Invalid status value" });
    }

    try {
      const statuses = await ComplaintStatusModel.find({ status }).sort({ updatedAt: -1 });

      res.send({ message: `Complaints with status: ${status}`, payload: statuses });
    } catch (error) {
      res.status(500).send({ message: "Server error", error: error.message });
    }
  })
);


module.exports=wardenApp;