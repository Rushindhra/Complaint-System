const exp=require('express')
const app=exp()
require('dotenv').config()
const mongoose=require('mongoose');
const hostelerApp = require('./API/hostelerApi');
const adminApp = require('./API/adminApi');
const wardenApp = require('./API/wardenApi');
const workerApp = require('./API/workerApi');
const port=process.env.PORT||4000;
mongoose.connect(process.env.DBURL)
.then(()=>app.listen(port,()=>console.log(`server listening on ${port}...`)))
.catch(err=>console.log("Error in connection ",err))
app.use("/hosteler-api",hostelerApp)
app.use("/admin-api",adminApp)
app.use("/warden-api",wardenApp)
app.use("/worker-api",workerApp)