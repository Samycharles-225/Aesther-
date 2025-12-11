module.exports = {
  config: {
    name: "status",
    aliases: ["botinfo"],
    version: "1.0",
    author: "Samy Charles",
    countDown: 5,
    role: 0,
    category: "info",
    shortDescription: "Afficher le statut du bot",
    longDescription: "Montre les informations importantes du bot."
  },

  onStart: async function ({ api, event }) {
    try {
      const timeStart = Date.now();

      // Récupérer les groupes
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = threads.filter(t => t.isGroup).length;

      // Calcul uptime
      let totalSeconds = process.uptime();
      let hours = Math.floor(totalSeconds / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      let seconds = Math.floor(totalSeconds % 60);

      // RAM utilisée
      const memory = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

      // Latence
      const ping = Date.now() - timeStart;

      const date = new Date();
      const formattedDate = date.toLocaleString("fr-FR");

      const msg =
`🌸✨ ── 🎀 𝗦𝗧𝗔𝗧𝗨𝗦 𝗕𝗢𝗧 🎀 ── ✨🌸

💫 『 𝗣𝗶𝗻𝗴 : ${ping}𝗺𝘀 』
🕑 『 𝗨𝗽𝘁𝗶𝗺𝗲 : ${hours}𝗵 ${minutes}𝗺 ${seconds}𝘀 』
👥 『 𝗚𝗿𝗼𝘂𝗽𝗲𝘀 : ${groups} 』
💾 『 𝗥𝗔𝗠 : ${memory} MB 』

📅 『 ${formattedDate} 』

🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ 💖`;

      // Empêche l’erreur "message vide"
      if (!msg || msg.trim() === "") {
        return api.sendMessage("❌ Une erreur interne est survenue.", event.threadID, event.messageID);
      }

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        `❌ Une erreur est survenue en exécutant "status".`,
        event.threadID,
        event.messageID
      );
    }
  }
};
