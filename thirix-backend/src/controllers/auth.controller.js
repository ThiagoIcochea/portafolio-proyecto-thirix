const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
    try {

        const {
  username,
  firstName,
  lastName,
  motherLastName,
  email,
  password,
  birthDate,
  gender,
  profession,
  interests
} = req.body;

     
        if (!username || !email || !password || !firstName || !lastName || !motherLastName  || !birthDate || !gender ) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            }); 
        }

       
        const existingUser = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "El usuario o correo ya existe"
            });
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await User.create({
  username,
  firstName,
  lastName,
  motherLastName,
  email,
  password: hashedPassword,
  birthDate,
  gender,
  profession,
  interests
});

        res.status(201).json({
            message: "Usuario registrado correctamente",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login exitoso",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const logout = async (req, res) => {

    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        message: "Sesión cerrada"
    });

};

module.exports = {
    register,
    login,
    logout
};