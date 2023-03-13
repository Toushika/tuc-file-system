const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);
    if (token == null)
        return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_TOKEN_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user
        console.log("authorized");
        next();
    })
};