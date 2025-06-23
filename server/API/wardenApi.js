const exp=require('express')
const wardenApp=exp.Router()
wardenApp.get("/",(req,res)=>{
    res.send({message:"Working perfect"})
})
module.exports=wardenApp;