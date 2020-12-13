const hasAccessAdmin = (req,res,next)=>
{
    if(req.session.userInfo==null)
    {
        res.redirect("/login");
    }
    if(req.session.userInfo!=null && req.session.userInfo.userType == "user")
    {
        res.redirect("/user");
    }
    else
    {
        next();
    }
}

module.exports=hasAccessAdmin;