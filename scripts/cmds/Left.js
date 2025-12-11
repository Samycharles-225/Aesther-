module.exports = {
  config: {
    name: "left",
    aliases: ["quit", "leave"],
    version: "1.0",
    author: "SamyCharlesღ",
    countDown: 3,
    role: 0,
    description: {
      fr: "Fait quitter le bot du groupe (réservé à Samy)"
    },
    category: "owner"
  },

  onStart: async function ({ api, event }) {
    const ownerID = "61582382664051"; // Ton ID

    if (event.senderID !== ownerID) {
      return api.sendMessage(
        "❌ | Seul mon créateur peut utiliser cette commande.",
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage(
      `🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞  :\nJe quitte le groupe… prenez soin de vous 💗`,
      event.threadID,
      () => {
        api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
      }
    );
  }
};
