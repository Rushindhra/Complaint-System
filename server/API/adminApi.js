const exp=require('express')
const adminApp=exp.Router()
adminApp.get("/",(req,res)=>{
    res.send({message:"Working perfect"})
})
module.exports=adminApp;