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
        origin: "http://localhost:5173",
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