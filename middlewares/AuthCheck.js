
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma')

exports.authCheck = async (req, res, next) => {
    try {
        const headerToken = req.headers.authorization

        if (!headerToken) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }


        const token = headerToken.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        req.user = decoded





        const user = await prisma.user.findFirst({
            where: {
                email: req.user.email
            }
        })

        if (!user.enabled) {
            return res.status(403).json({ message: "User is disabled, access denied" });
        }

        next()
    } catch (error) {
        res.status(500).json({ message: "Token Invalid", error: error.message });
    }
}

exports.checkAdmin = async (req, res, next) => {
    try {
        const { email } = req.user
        const adminUser = await prisma.user.findFirst({
            where: {
                email: email,
                role: 'admin'
            }
        })
        if(!adminUser){
            return res.status(403).json({ message: "Access denied, not an admin" });
        }
     next()
    } catch (error) {
        res.status(500).json({ message: "Cannot Admin Access", error: error.message });
    }
}
