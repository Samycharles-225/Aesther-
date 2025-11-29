const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "duck",
    author: "Christus",
    category: "image",
    version: "1.0",
    role: 0,
    shortDescription: "🦆 Envoie une image de canard aléatoire",
    longDescription: "Récupère une image de canard aléatoire depuis l'API.",
    guide: "{p}{n} — Affiche une image de canard aléatoire"
  },

  onStart: async function({ api, event }) {
    try {
      const apiUrl = "https://xsaim8x-xxx-api.onrender.com/api/duck"; // API Canard

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      const tempPath = path.join(__dirname, "duck_temp.jpg");
      fs.writeFileSync(tempPath, buffer);

      await api.sendMessage(
        {
          body: "🦆 Voici un canard aléatoire pour toi !",
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(tempPath);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Impossible de récupérer l'image du canard.\n" + err.message, event.threadID, event.messageID);
    }
  }
};
