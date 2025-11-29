const ytSearch = require("yt-search");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://65.109.80.126:20409/aryan/yx";

async function fetchStream(url) {
  const res = await axios({ url, responseType: "stream" });
  return res.data;
}

module.exports = {
  config: {
    name: "youtube",
    aliases: ["ytb"],
    version: "0.0.9",
    author: "Christus",
    countDown: 5,
    role: 0,
    description: { fr: "Rechercher et télécharger une vidéo/audio YouTube" },
    category: "média",
    guide: { fr: "{pn} -v <recherche|url>\n{pn} -a <recherche|url>" }
  },

  onStart: async function ({ api, args, event, commandName }) {
    const mode = args[0];
    if (!["-v", "-a"].includes(mode))
      return api.sendMessage("❌ Utilisation : /ytb [-a|-v] <recherche ou URL YouTube>", event.threadID, event.messageID);

    const query = args.slice(1).join(" ");
    if (!query) return api.sendMessage("❌ Fournissez une recherche ou une URL.", event.threadID, event.messageID);

    if (query.startsWith("http")) {
      if (mode === "-v") return await downloadYT(query, "mp4", api, event);
      else return await downloadYT(query, "mp3", api, event);
    }

    try {
      const results = await ytSearch(query);
      const videos = results.videos.slice(0, 6);
      if (videos.length === 0) return api.sendMessage("❌ Aucun résultat trouvé.", event.threadID, event.messageID);

      let body = "";
      videos.forEach((vid) => {
        const quality = mode === "-v" ? (vid.seconds ? "360p" : "Inconnue") : "128kbps";
        body += `• Titre : ${vid.title}\n• Qualité : ${quality}\n\n`;
      });

      const thumbnails = await Promise.all(videos.map(v => fetchStream(v.thumbnail)));

      api.sendMessage(
        { body: body + "Répondez avec un numéro (1-6) pour télécharger", attachment: thumbnails },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            results: videos,
            type: mode
          });
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Impossible de rechercher sur YouTube.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ event, api, Reply }) {
    const { results, type } = Reply;
    const choice = parseInt(event.body);

    if (isNaN(choice) || choice < 1 || choice > results.length)
      return api.sendMessage("❌ Sélection invalide. Choisissez un numéro entre 1 et 6.", event.threadID, event.messageID);

    const video = results[choice - 1];
    await api.unsendMessage(Reply.messageID);

    if (type === "-v") await downloadYT(video.url, "mp4", api, event);
    else await downloadYT(video.url, "mp3", api, event);
  }
};

async function downloadYT(url, format, api, event) {
  try {
    const { data } = await axios.get(`${API_BASE}?url=${encodeURIComponent(url)}&type=${format}`);
    const downloadUrl = data.download_url;
    if (!data.status || !downloadUrl) throw new Error("API a échoué");

    const filePath = path.join(__dirname, `yt_${Date.now()}.${format}`);
    const writer = fs.createWriteStream(filePath);
    const stream = await axios({ url: downloadUrl, responseType: "stream" });
    stream.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await api.sendMessage(
      { attachment: fs.createReadStream(filePath) },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );
  } catch (err) {
    console.error(`${format} erreur :`, err.message);
    api.sendMessage(`❌ Échec du téléchargement de ${format}.`, event.threadID, event.messageID);
  }
}
