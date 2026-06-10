const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const {
    getNotifications,
    markAsRead
} = require(
    "../controllers/notification.controller"
);

router.get(
    "/",
    protect,
    getNotifications
);

router.put(
    "/:id/read",
    protect,
    markAsRead
);

module.exports = router;