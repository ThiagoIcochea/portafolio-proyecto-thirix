const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost
} = require("../controllers/post.controller");

router.post(
    "/",
    protect,
    upload.array("media", 10),
    createPost
);

router.get(
    "/",
    protect,
    getPosts
);

router.get(
    "/:id",
    protect,
    getPostById
);

router.put(
    "/:id",
    protect,
    updatePost
);

router.delete(
    "/:id",
    protect,
    deletePost
);

router.post(
    "/:id/like",
    protect,
    likePost
);



module.exports = router;