const User = require("../models/User");
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const Notification = require("../models/Notification");

const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
            .select("-password")
            .populate(
                "savedPosts",
                "content media createdAt"
            );

        res.status(200).json({
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const updateProfile = async (req, res) => {
    try {

        const {
            firstName,
            lastName,
            motherLastName,
            birthDate,
            gender,
            profession,
            bio,
            location,
            website,
            interests,
            coverImage
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                firstName,
                lastName,
                motherLastName,
                birthDate,
                gender,
                profession,
                bio,
                location,
                website,
                interests,
                coverImage
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        res.status(200).json({
            message: "Perfil actualizado",
            user: updatedUser
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const uploadAvatar = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Debe seleccionar una imagen"
            });
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: "thirix/perfiles"
            }
        );

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                avatar: result.secure_url
            },
            {
                new: true
            }
        ).select("-password");

        res.status(200).json({
            message: "Foto de perfil actualizada",
            avatar: user.avatar,
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const uploadCoverImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Debe seleccionar una imagen"
            });
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: "thirix/portadas"
            }
        );

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                coverImage: result.secure_url
            },
            {
                new: true
            }
        ).select("-password");

        res.status(200).json({
            message: "Portada actualizada",
            coverImage: user.coverImage,
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const savePost = async (req, res) => {
    try {

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Publicación no encontrada"
            });
        }

        const user = await User.findById(req.user._id);

        const alreadySaved = user.savedPosts.some(
            id => id.toString() === postId
        );

        if (alreadySaved) {

            user.savedPosts = user.savedPosts.filter(
                id => id.toString() !== postId
            );

        } else {

            user.savedPosts.push(postId);

        }

        await user.save();

        res.status(200).json({
            saved: !alreadySaved,
            totalSaved: user.savedPosts.length
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getSavedPosts = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
            .populate({
                path: "savedPosts",
                populate: {
                    path: "author",
                    select: "username firstName lastName avatar isVerified"
                }
            });

        res.status(200).json({
            total: user.savedPosts.length,
            posts: user.savedPosts
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const followUser = async (req, res) => {
    try {

        const targetUserId = req.params.id;

        if (targetUserId === req.user._id.toString()) {
            return res.status(400).json({
                message: "No puedes seguirte a ti mismo"
            });
        }

        const currentUser = await User.findById(req.user._id);

        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const alreadyFollowing = currentUser.following.some(
            id => id.toString() === targetUserId
        );

        if (alreadyFollowing) {
            return res.status(400).json({
                message: "Ya sigues a este usuario"
            });
        }

        currentUser.following.push(targetUserId);

        targetUser.followers.push(req.user._id);

        await currentUser.save();
        await targetUser.save();

   

await Notification.create({
    recipient: targetUser._id,
    sender: currentUser._id,
    type: "FOLLOW"
});


const io = req.app.get("io");

io.emit(
    "new_follower",
    {
        followerId: req.user._id,
        targetUserId: targetUser._id
    }
);

        res.status(200).json({
            message: "Usuario seguido correctamente"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


const unfollowUser = async (req, res) => {
    try {

        const targetUserId = req.params.id;

        const currentUser = await User.findById(req.user._id);

        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        currentUser.following = currentUser.following.filter(
            id => id.toString() !== targetUserId
        );

        targetUser.followers = targetUser.followers.filter(
            id => id.toString() !== req.user._id.toString()
        );

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            message: "Usuario dejado de seguir"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getUserProfile = async (req, res) => {
    try {

        const user = await User.findById(req.params.id)
            .select("-password")
            .populate(
                "followers",
                "username firstName lastName avatar"
            )
            .populate(
                "following",
                "username firstName lastName avatar"
            );

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const searchUsers = async (req, res) => {
    try {

        const query = req.query.q;

        if (!query || query.trim() === "") {
            return res.status(200).json([]);
        }

        const users = await User.find({
            $or: [
                {
                    username: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    firstName: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    lastName: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    motherLastName: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        })
       .select(
    "_id username firstName lastName motherLastName avatar isVerified followers following"
)
.limit(20);
        

        res.status(200).json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
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
};