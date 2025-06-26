const exp=require('express')
const wardenApp=exp.Router()

//to import the warden model
const Warden=require('../models/warden/wardenModel')

// to import verification model
const Verification=require('../models/warden/verificationModel')

//to import notification model
const Notification=require('../models/warden/notificationModel')
wardenApp.use(exp.json())

//to add the warden into the database
wardenApp.post("/warden",async(req,res)=>{
    const newWarden= req.body;
    const wardenDoc=new Warden(newWarden);
    console.log(wardenDoc);
    await wardenDoc.save();
    res.send({Message:"Warden is added"});
})

//to verify the complaint givn by the student
wardenApp.put("/warden/verify", async (req, res) => {
    try {
        const { complaintId, isLegit, remarks } = req.body;
        // Check if the complaint exists
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).send({ error: "Complaint not found" });
        }
        // Create a new verification entry
        const verification = new Verification({
            complaintId,
            isLegit,
            remarks
        });
        await verification.save();
        // Optionally update the complaint status
        if (isLegit) {
            complaint.status = "verified";
        } else {
            complaint.status = "rejected";
        }
        await complaint.save();
        res.status(200).send({ message: "Complaint verification updated", verification });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).send({ error: "Internal server error" });
    }
})

//to send the notification to the student
wardenApp.post('/warden/notify', async (req, res) => {
  try {
    const { title, description, receiverId, complaintId } = req.body;

    // basic validation
    if (!title || !description)
      return res.status(400).send({ error: 'title & description are required' });

    let targetUserId = null;  // null = broadcast

    // CASE A: explicit receiverId
    if (receiverId) {
      const user = await User.findById(receiverId);
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
});

module.exports=wardenApp;