const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "blur",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "image",
    description: "Floute l'image répondue en utilisant le niveau spécifié",
    guide: "{pn} [niveau] — Répondre à une image et choisir le niveau de flou (par défaut 3)"
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      let blurLevel = parseInt(args[0]) || 3;
      let imageUrl;

      if (event.type === "message_reply") {
        const attachment = event.messageReply.attachments?.[0];
        if (!attachment)
          return message.reply("❌ | Veuillez répondre à une image.");
        if (attachment.type !== "photo")
          return message.reply("❌ | Seules les images sont prises en charge. Les vidéos ou fichiers ne sont pas autorisés.");
        imageUrl = attachment.url;
      } else {
        return message.reply("❌ | Veuillez répondre à une image pour utiliser cette commande.");
      }

      api.setMessageReaction("🌫️", event.messageID, () => {}, true);
      const waitMsg = await message.reply(`Application du flou niveau ${blurLevel}... 🌫️`);

      const RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const { data } = await axios.get(RAW);
      const apiBase = data.apiv1;

      const apiUrl = `${apiBase}/api/blur?url=${encodeURIComponent(imageUrl)}&level=${encodeURIComponent(blurLevel)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const filePath = path.join(__dirname, "cache", `blur_${Date.now()}.png`);
      await fs.outputFile(filePath, response.data);

      message.unsend(waitMsg.messageID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      message.reply({
        body: `✅ | Voici votre image floutée (Niveau : ${blurLevel}) 🌫️`,
        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error(error);
      message.reply("❌ | Échec de l'application du flou. Veuillez réessayer plus tard.");
    }
  }
};
