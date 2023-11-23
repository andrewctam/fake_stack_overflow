const fs = require("fs")

const privateKey = fs.readFileSync('./private.key', 'utf8');
const publicKey = fs.readFileSync('./public.key', 'utf8');
const signOptions = {
    algorithm: "RS256",
    expiresIn: "1h"
};

const verifyOptions = {
    algorithm: ['RS256'],
};

module.exports = { privateKey, publicKey, signOptions, verifyOptions }
