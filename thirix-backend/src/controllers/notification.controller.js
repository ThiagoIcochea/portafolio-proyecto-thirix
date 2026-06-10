const Notification = require("../models/Notification");


const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      recipient: userId
    })
      .populate("sender", "username firstName lastName avatar")
      .populate("post", "content media")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({
      message: "Error al obtener notificaciones"
    });
  }
};


const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notificación no encontrada"
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "No autorizado"
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({
      message: "Error al marcar como leída"
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};