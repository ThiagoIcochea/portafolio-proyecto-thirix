const express = require("express");

const router = express.Router();

const protect =
require("../middlewares/auth.middleware");
const upload =
require("../middlewares/upload.middleware");

const {
    sendMessage,
    getMessages,
    markAsRead
} = require(
    "../controllers/message.controller"
);

router.post(
    "/:conversationId",
    protect,
    upload.array(
        "attachments",
        10
    ),
    sendMessage
);

router.get(
    "/:conversationId",
    protect,
    getMessages
);

router.put(
    "/read/:id",
    protect,
    markAsRead
);

module.exports = router;