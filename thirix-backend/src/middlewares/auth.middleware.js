const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const tokenFromHeader = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : null;
        const token = tokenFromHeader || req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "No autorizado"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                message: "Usuario no encontrado"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token inválido"
        });

    }
};

module.exports = protect;