const rateLimiter = require('express-rate-limit');
module.exports= rateLimiter({
    windowMs:  10*60 * 1000, // 15 minutes
    max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
    headers: true,
    //standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    //legacyHeaders: true, // Disable the `X-RateLimit-*` headers
    handler: function (req, res, /*next*/) {
        return res.status(429).json({
            error: 'You sent too many requests. Please wait 1 minutes then try again'
        })},
});
