const exp=require('express')
const studentApp=exp.Router();
const expressAsyncHandler=require('express-async-handler')
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HostellerModel=require('../models/hosteller/hostellerModel');
const ComplaintModel=require('../models/complaintModel');
const ComplaintStatusModel=require('../models/hosteller/complaintStatusModel');
const verifyToken=require('../middleware/verifytoken')

studentApp.use(exp.json());

//get all compliants by studentId
studentApp.get("/complaints/:studentId",verifyToken,expressAsyncHandler(async(req,res)=>{
    const studentId=req.params.studentId;
    const complaints=await ComplaintModel.find({createdBy:studentId})
    res.status(200).send({ message: "Complaints fetched successfully", payload: complaints });
}))

//post complaint by student initial
// studentApp.post("/postcomplaint", verifyToken,expressAsyncHandler(async (req, res) => {
//   const complaintData = req.body;

//   const newComplaint = await ComplaintModel.create(complaintData);

//   // ⬇️ Create initial status
//   await ComplaintStatusModel.create({
//     complaintId: newComplaint._id,
//     updatedBy: complaintData.createdBy, // Assuming student
//     status: 'Not Done Yet'
//   });

//   res.status(201).send({ message: "Complaint registered successfully", payload: newComplaint });
// }));

//post a complaint with validation
// POST /student-api/students/:rollno/complaints
studentApp.post(
  "/:rollno/postcomplaint",
  verifyToken,
  expressAsyncHandler(async (req, res) => {

    const rollno = req.params.rollno.trim();
    const { title, description, category } = req.body;
    if (!title || !description || !category)
      return res.status(400).send({ message: "title, description, category are required" });

    /* fetch student profile */
    const student = await HostellerModel.findOne({ Id: rollno });
    if (!student) return res.status(404).send({ message: "Student not found" });

    const roomno = student.roomNumber;
    const block  = student.block;

    /* block if ANY open complaint exists for this student */
    const openComplaint = await ComplaintModel.findOne({
      createdBy: rollno,
      status:   { $ne: "Completed" }          // unresolved
    });
    if (openComplaint)
      return res.status(429).send({ message: "Resolve your previous complaint before filing a new one." });

    /* prevent duplicate (same category+location same day) */
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    const dup   = await ComplaintModel.findOne({
      createdBy: rollno,
      category, roomno, block,
      createdAt: { $gte: start, $lte: end }
    });
    if (dup)
      return res.status(409).send({ message: "Similar complaint already logged today." });

    /* create complaint */
    const complaint = await ComplaintModel.create({
      createdBy: rollno,
      title: title.trim(),
      description,
      category,
      roomno,
      block
    });

    /* initial status log */
    await ComplaintStatusModel.create({
      complaintId: complaint._id,
      updatedBy:   rollno,
      status:      'Not Done Yet'
    });

    res.status(201).send({ message: "Complaint registered", payload: complaint });
  })
);



//edit their profile
studentApp.put("/editprofile/:studentId",verifyToken, expressAsyncHandler(async (req, res) => {
  const studentId = req.params.studentId;
  const updatedData = { ...req.body };

  // ❌ Remove fields that should NOT be updated
  delete updatedData.role;
  delete updatedData.Id;
  delete updatedData.email;
  //delete fileds should be handled correctly during frontened implementation

  const updatedProfile = await HostellerModel.findOneAndUpdate(
    {Id:studentId},
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
studentApp.delete("/deleteprofile/:studentId", verifyToken,expressAsyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  const deletedProfile = await HostellerModel.findOneAndDelete({ Id: studentId });

  if (!deletedProfile) {
    return res.status(404).send({ message: "Profile not found for deletion" });
  }

  res.status(200).send({ message: "Profile deleted successfully", payload: deletedProfile });
}));


//get complaint status by studentId and complaintId
studentApp.get("/complaint/status/:studentId/:complaintId",verifyToken, expressAsyncHandler(async (req, res) => {
  const { studentId, complaintId } = req.params;

  // Check complaint exists and was created by this student
  const complaint = await ComplaintModel.findOne({
    _id: complaintId,
    createdBy: studentId
  });

  if (!complaint) {
    return res.status(404).send({ message: "No complaint found for this student and complaint ID" });
  }

  // Fetch complaint status
  const statusDoc = await ComplaintStatusModel.findOne({
    complaintId: complaintId
  })
  //.populate("complaintId");  (if you want to get total complaint details also we can use this)

  if (!statusDoc) {
    return res.status(404).send({ message: "Status not found for the given complaint" });
  }

  res.status(200).send({
    message: "Complaint status fetched successfully",
    payload: statusDoc.status
  });
}));

// //modify the complaint status

// studentApp.put("/complaint/status/:complaintId", expressAsyncHandler(async (req, res) => {
//   const { complaintId } = req.params;
//   const { status } = req.body;

//   // Find the complaint and update its status
//   const updatedComplaint = await Complaint
// Model.findByIdAndUpdate(complaintId, { status }, { new: true });
//   if (!updatedComplaint) {
//     return res.status(404).send({ message: "Complaint not found" });
//   }

//   // Create or update the status record
//   const updatedStatus = await ComplaintStatusModel.findOneAndUpdate(
//     { complaintId: complaintId },
//     { status: status },
//     { new: true, upsert: true }
//   );

//   res.status(200).send({
//     message: "Complaint status updated successfully",
//     payload: updatedStatus
//   });
// }


//read all complaints
// studentApp.get(
//   "/complaints/my",                 // cleaner path name
//   verifyToken,           // ensure only students call it
//   expressAsyncHandler(async (req, res) => {
//     const studentId = req.userId;          // ← from JWT

//     const complaints = await ComplaintModel.find({ createdBy: studentId });

//     if (!complaints.length) {
//       return res.status(404).send({ message: "No complaints found for this student" });
//     }

//     res.status(200).send({
//       message: "Student complaints fetched successfully",
//       payload: complaints
//     });
//   })
// );

//modify the complaint status
studentApp.put(
  "/:rollno/complaints/:id/status",
  verifyToken,
  expressAsyncHandler(async (req, res) => {

    const { rollno, id } = req.params;
    const { status }     = req.body; // "In Progress" | "Completed"
    if (!status)
      return res.status(400).send({ message: "status is required" });

    const complaint = await ComplaintModel.findOne({ _id: id, createdBy: rollno });
    if (!complaint)
      return res.status(404).send({ message: "Complaint not found for this student" });

    complaint.status = status;
    await complaint.save();

    await ComplaintStatusModel.create({
      complaintId: id,
      updatedBy:   rollno,
      status
    });

    res.send({ message: "Status updated", payload: complaint });
  })
);



//edit complaint
studentApp.put(
  "/complaint/edit/:complaintId",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    const { complaintId } = req.params;
    const updatedData = req.body;

    
    const complaint = await ComplaintModel.findById(complaintId);
    if (!complaint) {
      return res.status(404).send({ message: "Complaint not found" });
    }

    const lockedStatuses = ["Resolved", "Completed"];
    if (lockedStatuses.includes(complaint.status)) {
      return res.status(403).send({
        message: `Cannot edit a complaint that is already ${complaint.status}.`,
      });
    }

   
    const updatedComplaint = await ComplaintModel.findByIdAndUpdate(
      complaintId,
      updatedData,
      { new: true }
    );

    res.status(200).send({
      message: "Complaint updated successfully",
      payload: updatedComplaint,
    });
  })
);




//delete complaint
studentApp.delete("/complaint/delete/:complaintId", verifyToken,expressAsyncHandler(async (req, res) => {
  const { complaintId } = req.params;

  // Find the complaint and delete it
  const deletedComplaint = await ComplaintModel.findByIdAndDelete(complaintId);
  if (!deletedComplaint) {
    return res.status(404).send({ message: "Complaint not found" });
  }

  res.status(200).send({ message: "Complaint deleted successfully", payload: deletedComplaint });
}))




// 🔑 POST - Register (Signup) a new student/hosteller
studentApp.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const newUser = req.body;
    console.log("Register request received:", newUser);

    const userExists = await HostellerModel.findOne({ email: newUser.email });
    if (userExists) {
      return res.status(409).send({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(newUser.password, 10);
    newUser.password = hashedPassword;

    const dbRes = await HostellerModel.create(newUser);
    console.log("User registered:", dbRes);

    res.status(201).send({ message: "User registered successfully", payload: dbRes });
  })
);


//post-login a studnet/hosteller
studentApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    const user = await HostellerModel.findOne({ email });
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


module.exports = studentApp;
