const hasAccess = (req,res,next)=>
{
    if(req.session.userInfo==null)
    {
        res.redirect("/login");
    }
    else
    {
        next();
    }
}

module.exports=hasAccess;