const exp=require('express')
const hostelerApp=exp.Router()
hostelerApp.get("/",(req,res)=>{
    res.send({message:"Working perfect"})
})
module.exports=hostelerApp;