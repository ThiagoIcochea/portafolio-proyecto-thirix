require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");

const {
    initializeSocket
} = require("./socket/socket");

connectDB();

const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "https://portafolio-proyecto-thirix-1.onrender.com",
        credentials: true
    }
});

app.set("io", io);

initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(
        `Servidor ejecutándose en puerto ${PORT}`
    );

});