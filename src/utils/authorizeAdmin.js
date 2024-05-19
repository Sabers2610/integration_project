const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.admin) {
        return res.status(403).send('Access denied: insufficient permissions');
    }
    next();
};

module.exports = authorizeAdmin
