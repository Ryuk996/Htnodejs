const Users = require('./models');

exports.postUser = async (req,res,next) => {
    const user= new Users({
        firstName :req.body.firstName,
        lastName :req.body.lastName,
        userName : req.body.userName,
        password : req.body.password
    })
    const response = await user.save();
    res.send(response)
}