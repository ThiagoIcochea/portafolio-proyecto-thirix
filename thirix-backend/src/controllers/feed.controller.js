const User = require("../models/User");
const Post = require("../models/Post");

const getFeed = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        const authors = [
            ...user.following,
            req.user._id
        ];

        const posts = await Post.find({
            author: { $in: authors }
        })
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

module.exports = {
    getFeed
};