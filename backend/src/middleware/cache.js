const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        res.originalJson = res.json;
        res.json = (body) => {
            cache.set(key, body, duration);
            res.originalJson(body);
        };

        next();
    };
};

const clearCache = (pattern) => {
    const keys = cache.keys();
    const regex = new RegExp(pattern);
    keys.forEach(key => {
        if (regex.test(key)) {
            cache.del(key);
        }
    });
};

module.exports = {
    cacheMiddleware,
    clearCache
}; 