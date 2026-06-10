const express = require("express");

const router = express.Router();

const protect =
require("../middlewares/auth.middleware");

const {
    createConversation,
    getConversations
} = require(
    "../controllers/conversation.controller"
);

router.post(
    "/",
    protect,
    createConversation
);

router.get(
    "/",
    protect,
    getConversations
);

module.exports = router;