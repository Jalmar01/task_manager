const authService = require('./auth.service');

async function login(req, res)  {
    try {
        const result = await authService.login(req.body);
        return res.status(200).json({
        message: 'Login successful',
        data: result
    })
    }catch(error){
        return res.status(401).json({
            message: error.message
        });
    }
};
async function me (req, res) {
    try{
        const user = await authService.getMe(req.user.id);
        return res.status(200).json({
            message:'User profile',
            data: user
        });
    }catch(error){
        return res.status(404).json({
            message: error.message
        });
    };
};




module.exports= { 
    login,
    me 
};