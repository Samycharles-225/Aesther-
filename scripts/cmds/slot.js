const { GoatWrapper } = require("fca-saim-x69x");

module.exports = {
  config: {
    name: "slot",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "game",
    description: "🎰 Un jeu de machine à sous amusant ! Place ta mise, lance les rouleaux et découvre combien tu peux gagner. Frissons garantis à chaque spin !",
    usage: "slot <montant>\nExemple : /slot 1000"
  },

  onStart: async function ({ event, api, usersData, args }) {
    const userId = event.senderID;
    const bet = parseInt(args[0]);

    let user = await usersData.get(userId);
    if (!user) {
      user = { money: 0 };
      await usersData.set(userId, user);
    }

    let prefix = event.body ? event.body[0] : "/";

    if (!bet || bet <= 0) {
      return api.sendMessage(
        `❌ ENTREZ UNE MISE VALIDE.\nEXEMPLE : ${prefix}slot 1000`,
        event.threadID,
        event.messageID
      );
    }

    if (user.money < bet) {
      return api.sendMessage(
        `❌ SOLDE INSUFFISANT.\nSOLDE ACTUEL : ${user.money}$`,
        event.threadID,
        event.messageID
      );
    }

    user.money -= bet;

    const symbols = ["🍒", "🍋", "🔔", "⭐", "💎"];
    let s1, s2, s3;

    const chance = Math.random();

    if (chance < 0.50) {
      s1 = s2 = symbols[Math.floor(Math.random() * symbols.length)];
      s3 = symbols[Math.floor(Math.random() * symbols.length)];
    } 
    else if (chance < 0.70) {
      s1 = s2 = s3 = symbols[Math.floor(Math.random() * symbols.length)];
    } 
    else {
      const shuffled = symbols.sort(() => 0.5 - Math.random());
      s1 = shuffled[0];
      s2 = shuffled[1];
      s3 = shuffled[2];
    }

    let winnings = 0;
    let status = "";

    if (s1 === s2 && s2 === s3) {
      winnings = bet * 3;
      user.money += winnings;
      status = `✅ TRIPLE MATCH !\n│  TU AS GAGNÉ ${winnings}$ 🎉`;
    }
    else if (s1 === s2 || s1 === s3 || s2 === s3) {
      winnings = bet * 2;
      user.money += winnings;
      status = `✅ DOUBLE MATCH !\n│  TU AS GAGNÉ ${winnings}$ 🎉`;
    }
    else {
      status = `😢 PAS DE MATCH.\n│  TU AS PERDU ${bet}$`;
    }

    await usersData.set(userId, user);

    let spinningMsg = await api.sendMessage("🎰 MACHINE À SOUS\nLancement... 🍒🍋🔔", event.threadID, event.messageID);

    const spinSteps = [
      [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
      [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
      [s1, s2, s3]
    ];

    for (let step of spinSteps) {
      await new Promise(r => setTimeout(r, 1000));
      await api.editMessage(
        `━━━━━━━━━━━━━━
🎰 MACHINE À SOUS
╭─╼━━━━━━━━━━╾─╮
│     ${step[0]} | ${step[1]} | ${step[2]}
│
│  ${status}
╰─╼━━━━━━━━━━╾─╯
💰 SOLDE : ${user.money}$
━━━━━━━━━━━━━━`,
        spinningMsg.messageID,
        event.threadID
      );
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
