const express = require("express");
const router = express.Router();

module.exports = (liveStreams) => {
  router.get("/active", (req, res) => {
    const active = Array.from(liveStreams.entries()).map(
      ([id, data]) => ({
        streamId: id,
        hostId: data.hostId,
        viewers: data.viewers.size,
        reactions: data.reactions
      })
    );

    res.json(active);
  });

  return router;
};