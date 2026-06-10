const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const cloudinary = require("../config/cloudinary");

const normalizeAttachments = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.filter(item => item && typeof item === "object");
    }

    if (typeof value !== "string") return [];

    const cleaned = value.trim();
    if (!cleaned) return [];

    try {
        const parsed = JSON.parse(cleaned.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
            return parsed.filter(item => item && typeof item === "object");
        }
        return parsed && typeof parsed === "object" ? [parsed] : [];
    } catch (error) {
        return [];
    }
};

const sendMessage = async (req, res) => {
    try {
console.log("========== MESSAGE DEBUG ==========");
console.log("Headers:", req.headers["content-type"]);
console.log("Body:", req.body);
console.log("Files:", req.files);
console.log("==================================");

        const { text } = req.body;

        const hasText = typeof text === 'string' && text.trim() !== '';
        const hasFiles = req.files && req.files.length > 0;

        if (!hasText && !hasFiles) {
            return res.status(400).json({
                message: "El mensaje no puede estar vacío"
            });
        }

        const conversation =
            await Conversation.findById(
                req.params.conversationId
            );

        if (!conversation) {
            return res.status(404).json({
                message: "Conversación no encontrada"
            });
        }

        const isParticipant =
    conversation.participants.some(
        participant =>
            participant.toString() ===
            req.user._id.toString()
    );

if (!isParticipant) {
    return res.status(403).json({
        message: "No autorizado"
    });
}

       const uploadedAttachments = [];

if (req.files && req.files.length > 0) {

    for (const file of req.files) {
    console.log("FILE DETECTED:");
    console.log({
        name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer
    });
}

    for (const file of req.files) {

try {

    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
            folder: "thirix/messages",
            resource_type: "auto"
        }
    );

    console.log("Cloudinary success:", result.secure_url);

   uploadedAttachments.push({
    url: result.secure_url,
    fileType: result.resource_type
});

} catch (err) {

    console.error("CLOUDINARY ERROR:");
    console.error(err);

    throw err;
}

       
    }
}

const parsedBodyAttachments = normalizeAttachments(req.body.attachments);
const attachmentsToSave = uploadedAttachments.length > 0
    ? uploadedAttachments
    : parsedBodyAttachments;

const messageText = hasText ? text.trim() : '';

console.log(
  "attachmentsToSave typeof:",
  typeof attachmentsToSave
);

console.log(
  "attachmentsToSave[0] typeof:",
  typeof attachmentsToSave[0]
);

console.log(
  "attachmentsToSave[0]:",
  attachmentsToSave[0]
);

const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: messageText,
    attachments: attachmentsToSave
});

     
        conversation.lastMessage = messageText || (attachmentsToSave.length > 0 ? 'Attachment' : '');
        conversation.lastMessageSender = req.user._id;

        await conversation.save();

        const populatedMessage =
            await Message.findById(message._id)
            .populate(
                "sender",
                "username firstName lastName avatar"
            );


        const io = req.app.get("io");

io.to(
    conversation._id.toString()
).emit(
    "receive_message",
    populatedMessage
);

        res.status(201).json(
            populatedMessage
        );

    } catch (error) {

        console.error('sendMessage error:', error);

        res.status(500).json({
            message: error.message
        });

    }
};

const getMessages = async (req, res) => {
    try {

        const conversation =
    await Conversation.findById(
        req.params.conversationId
    );

if (!conversation) {
    return res.status(404).json({
        message: "Conversación no encontrada"
    });
}

const isParticipant =
    conversation.participants.some(
        participant =>
            participant.toString() ===
            req.user._id.toString()
    );

if (!isParticipant) {
    return res.status(403).json({
        message: "No autorizado"
    });
}

        const messages =
            await Message.find({
                conversation:
                    req.params.conversationId
            })
            .populate(
                "sender",
                "username firstName lastName avatar"
            )
            .sort({
                createdAt: 1
            });

        res.status(200).json(
            messages
        );

    } catch (error) {

        console.error('getMessages error:', error);

        res.status(500).json({
            message: error.message
        });

    }
};


const markAsRead = async (req, res) => {
    try {

        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                message: "Mensaje no encontrado"
            });
        }

        const conversation = await Conversation.findById(
            message.conversation
        );

        const isParticipant =
            conversation.participants.some(
                participant =>
                    participant.toString() ===
                    req.user._id.toString()
            );

        if (!isParticipant) {
            return res.status(403).json({
                message: "No autorizado"
            });
        }

        message.isRead = true;

        await message.save();

const io = req.app.get("io");

io.to(
    conversation._id.toString()
).emit(
    "message_seen",
    {
        messageId: message._id,
        conversationId: conversation._id,
        readBy: req.user._id
    }
);

        res.status(200).json(message);

    } catch (error) {

        console.error('markAsRead error:', error);

        res.status(500).json({
            message: error.message
        });

    }
};



module.exports = {
    sendMessage,
    getMessages,
    markAsRead
};