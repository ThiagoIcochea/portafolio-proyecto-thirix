const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

const createComment = async (req, res) => {
    try {

        const { content } = req.body;

        const post = await Post.findById(
            req.params.postId
        );

        if (!post) {
            return res.status(404).json({
                message: "Publicación no encontrada"
            });
        }

        const comment = await Comment.create({
            author: req.user._id,
            post: post._id,
            content
        });

        post.commentsCount += 1;

        await post.save();

        if (
            post.author.toString() !==
            req.user._id.toString()
        ) {

            await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: "COMMENT",
                post: post._id
            });

        }

        const io = req.app.get("io");

io.emit(
    "new_comment",
    {
        postId: post._id,
        commentId: comment._id
    }
);

        res.status(201).json(comment);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getComments = async (req, res) => {
  try {

    const comments = await Comment.find({
      post: req.params.postId
    })
      .populate(
        "author",
        "username firstName lastName avatar"
      )
      .sort({
        createdAt: -1
      });

    res.status(200).json(comments);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const deleteComment = async (req, res) => {
  try {

    const comment = await Comment.findById(
      req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        message: "Comentario no encontrado"
      });
    }

    if (
      comment.author.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "No autorizado"
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      message: "Comentario eliminado"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment
};

