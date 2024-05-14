const jwt = require('jsonwebtoken');
require("dotenv").config()

// TODO: Ver como tratar los roles de usuario
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    const jwtSecret = process.env.JWT_SECRET_KEY;

    if (!jwtSecret) {
        return res.status(500).json({ message: 'Secret token is not defined' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            console.error(err);
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };
