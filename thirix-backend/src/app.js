const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const { liveStreams } = require("./socket/socket");
const liveRoutes = require("./routes/live.routes")(liveStreams);


const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const feedRoutes = require("./routes/feed.routes");
const notificationRoutes = require("./routes/notification.routes");
const conversationRoutes = require("./routes/conversation.routes");
const messageRoutes = require("./routes/message.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(helmet());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api/feeds", feedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/live", liveRoutes);
app.use(
    "/api/conversations",
    conversationRoutes
);
app.use(
    "/api/messages",
    messageRoutes
);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Bienvenido a la API de Thirix"
    });
});

module.exports = app;