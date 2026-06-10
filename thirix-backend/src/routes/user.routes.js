const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
    getProfile,
    updateProfile,
    uploadAvatar,
    uploadCoverImage,
    savePost,
    getSavedPosts,
    followUser,
    unfollowUser,
    getUserProfile,
    searchUsers
} = require("../controllers/user.controller");

router.get(
    "/profile",
    protect,
    getProfile
);

router.put(
    "/profile",
    protect,
    updateProfile
);

router.put(
    "/avatar",
    protect,
    upload.single("avatar"),
    uploadAvatar
);

router.put(
    "/cover-image",
    protect,
    upload.single("coverImage"),
    uploadCoverImage
);

router.post(
    "/saved-posts/:id",
    protect,
    savePost
);

router.get(
    "/saved-posts",
    protect,
    getSavedPosts
);



router.post(
    "/:id/follow",
    protect,
    followUser
);

router.post(
    "/:id/unfollow",
    protect,
    unfollowUser
);

router.get(
    "/search",
    protect,
    searchUsers
);

router.get(
    "/:id",
    protect,
    getUserProfile
);

module.exports = router;