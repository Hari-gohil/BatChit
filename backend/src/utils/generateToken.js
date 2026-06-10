const jwt = require('jsonwebtoken');
const { model } = require('mongoose');

const generateToken = (id, role) => {
    return jwt.sign(
        {
            id : id,
            role : role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d"
        }
    );
}

module.exports = generateToken;