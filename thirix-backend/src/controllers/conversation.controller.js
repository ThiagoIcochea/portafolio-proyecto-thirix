const Conversation = require("../models/Conversation");

const createConversation = async (req, res) => {
    try {

        const { userId } = req.body;

        const existingConversation =
            await Conversation.findOne({
                participants: {
                    $all: [
                        req.user._id,
                        userId
                    ]
                }
            });

        if (existingConversation) {
            return res.status(200).json(
                existingConversation
            );
        }

        const conversation =
            await Conversation.create({
                participants: [
                    req.user._id,
                    userId
                ]
            });

        res.status(201).json(
            conversation
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


const getConversations = async (req, res) => {
    try {

        const conversations =
            await Conversation.find({
                participants: req.user._id
            })
            .populate(
                "participants",
                "username firstName lastName avatar"
            )
            .sort({
                updatedAt: -1
            });

        res.status(200).json(
            conversations
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    createConversation,
    getConversations
};