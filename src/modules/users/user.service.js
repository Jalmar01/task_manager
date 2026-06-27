const bcrypt = require('bcrypt')
const User = require('./user.model');

async function createUser({ name, email, password, provider  }) {

    const existingUser = await findUserByEmail(email);

    if(existingUser) {
        throw new Error('Email already exists');
    }
    let hashedPassword = null;

    if(provider === 'local'){
        hashedPassword = await bcrypt.hash(password, 10);
    }
    
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            provider
        });
        return  newUser; 
}

async function findUserByEmail(email) {
    return await User.findOne({ 
        where: {email},
        attributes:{exclude:['password']}
    });
}

module.exports = {
    createUser,
    findUserByEmail
};