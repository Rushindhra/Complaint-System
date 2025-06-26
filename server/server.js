const exp=require('express')
const app=exp()
require('dotenv').config()
const mongoose=require('mongoose');
const hostelerApp = require('./API/hostelerApi');
const wardenApp = require('./API/wardenApi');
const port=process.env.PORT||4000;
mongoose.connect(process.env.DBURL)
.then(()=>app.listen(port,()=>console.log(`server listening on ${port}...`)))
.catch(err=>console.log("Error in connection ",err))

// app.use(cookieParser());
//Routes
app.use("/hosteler-api",hostelerApp)
app.use("/warden-api",wardenApp)
