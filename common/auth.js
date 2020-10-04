var jwt=require("jsonwebtoken")
var authenticate=function(req,res,next){
if(req.headers.authorization){
    jwt.verify(req.headers.authorization,"abcdefghijklmnopqrs",function(err,decode){

        if(err){
            res.json({
                message:"Token not valid"
            })
        }
        next();
    })

}
else{
    res.json({
        message:"Token not present"
    })
}
}
module.exports={authenticate}