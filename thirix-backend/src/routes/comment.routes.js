const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const {
  createComment,
  getComments,
  deleteComment
} = require("../controllers/comment.controller");

router.post(
  "/posts/:postId/comments",
  protect,
  createComment
);

router.get(
  "/posts/:postId/comments",
  protect,
  getComments
);

router.delete(
  "/comments/:commentId",
  protect,
  deleteComment
);

module.exports = router;