const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    version: "1.0.0",
    author: "Christus",
    countDown: 0,
    role: 0,
    shortDescription: "Téléverse une image/vidéo sur Imgur",
    longDescription: "Répondre à une image/vidéo ou fournir une URL pour la téléverser sur Imgur.",
    category: "utilitaire",
    guide: "{pn} répondre à une image/vidéo ou fournir une URL"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    let mediaUrl = "";

    if (messageReply && messageReply.attachments.length > 0) {
      mediaUrl = messageReply.attachments[0].url;
    } else if (args.length > 0) {
      mediaUrl = args.join(" ");
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Veuillez répondre à une image/vidéo ou fournir une URL !", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(`http://65.109.80.126:20409/aryan/imgur?url=${encodeURIComponent(mediaUrl)}`);
      const imgurLink = res.data.imgur;

      if (!imgurLink) {
        api.setMessageReaction("", messageID, () => {}, true);
        return api.sendMessage("❌ Échec du téléversement sur Imgur.", threadID, messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`${imgurLink}`, threadID, messageID);

    } catch (err) {
      console.error("Erreur de téléversement sur Imgur :", err);
      api.setMessageReaction("", messageID, () => {}, true);
      return api.sendMessage("⚠️ Une erreur est survenue lors du téléversement.", threadID, messageID);
    }
  }
};
