const jwt = require('jsonwebtoken')
const { secret } = require('../config')

module.exports = async function (req, res, next) {


    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: "Пользователь не авторизован" })
        }

        const token = authHeader.split(' ')[1]
        if (!token) {
            return res.status(403).json({ message: "Пользователь не авторизован" })
        }

        const decodedData = jwt.verify(token, secret)
        req.user = decodedData
        next()
    } catch (e) {
        console.log(e)
        return res.status(403).json({ message: "Пользователь не авторизован" })
    }
};
