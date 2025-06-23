const exp=require('express')
const workerApp=exp.Router()
workerApp.get("/",(req,res)=>{
    res.send({message:"Working perfect"})
})
module.exports=workerApp;