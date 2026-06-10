const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const Notification = require("../models/Notification");

const createPost = async (req, res) => {
    try {

        const uploadedMedia = [];

        if (req.files && req.files.length > 0) {

            for (const file of req.files) {

                const result = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                    {
                        folder: "thirix/posts",
                        resource_type: "auto"
                    }
                );

                uploadedMedia.push({
                    url: result.secure_url,
                    type: result.resource_type === "video"
                        ? "video"
                        : "image"
                });
            }
        }

        let taggedUsers = [];
        let hashtags = [];

        if (req.body.taggedUsers) {
            taggedUsers = JSON.parse(req.body.taggedUsers);
        }

        if (req.body.hashtags) {
            hashtags = JSON.parse(req.body.hashtags);
        }

        const post = await Post.create({
            author: req.user._id,
            content: req.body.content,
            media: uploadedMedia,
            taggedUsers,
            hashtags,
            location: req.body.location || "",
            visibility: req.body.visibility || "public"
        });

        res.status(201).json({
            message: "Publicación creada correctamente",
            post
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getPosts = async (req, res) => {
    try {

        const posts = await Post.find()
            .populate(
                "author",
                "username firstName lastName avatar isVerified"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json(posts);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getPostById = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
            .populate(
                "author",
                "username firstName lastName avatar isVerified"
            );

        if (!post) {
            return res.status(404).json({
                message: "Publicación no encontrada"
            });
        }

        res.status(200).json(post);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const updatePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Publicación no encontrada"
            });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "No autorizado"
            });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            message: "Publicación actualizada",
            post: updatedPost
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const deletePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Publicación no encontrada"
            });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "No autorizado"
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Publicación eliminada"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const likePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Publicación no encontrada"
            });
        }

        const userId = req.user._id;

        const alreadyLiked = post.likes.some(
            id => id.toString() === userId.toString()
        );

        if (alreadyLiked) {

            post.likes = post.likes.filter(
                id => id.toString() !== userId.toString()
            );

        } else {

            post.likes.push(userId);

            if (
                post.author.toString() !==
                userId.toString()
            ) {

                await Notification.create({
                    recipient: post.author,
                    sender: userId,
                    type: "LIKE",
                    post: post._id
                });

            }

        }

        await post.save();

        const io = req.app.get("io");

io.emit(
    "new_like",
    {
        postId: post._id,
        userId: req.user._id
    }
);

        res.status(200).json({
            likesCount: post.likes.length,
            liked: !alreadyLiked
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost
};