/*  
   🌸✨ 𓆩 𝗔𝗘𝗦𝗧𝗛𝗘𝗥 𝗞𝗮𝘄𝗮𝗶𝗶 𝗔𝗜 𝗠𝗼𝗱𝘂𝗹𝗲 𓆪 ✨🌸
   ❀ Made with love · Powered by cuteness · 100% aesthetic ❀
*/

const axios = require('axios');
const validUrl = require('valid-url');
const fs = require('fs');
const path = require('path');
const ytSearch = require('yt-search');
const { v4: uuidv4 } = require('uuid');

// 🌸 API kawaii endpoints
const API_ENDPOINT = "https://shizuai.vercel.app/chat";
const CLEAR_ENDPOINT = "https://shizuai.vercel.app/chat/clear";
const YT_API = "http://65.109.80.126:20409/aryan/yx";
const EDIT_API = "https://gemini-edit-omega.vercel.app/edit";

// 💖 Folder kawaii
const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

/* 📥 KAWAII DOWNLOAD FUNCTION */
const downloadFile = async (url, ext) => {
  const filePath = path.join(TMP_DIR, `${uuidv4()}.${ext}`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, Buffer.from(response.data));
  return filePath;
};

/* ♻️ RESET CONVERSATION – version cute */
const resetConversation = async (api, event, message) => {
  api.setMessageReaction("🌸", event.messageID, () => {}, true);
  try {
    await axios.delete(`${CLEAR_ENDPOINT}/${event.senderID}`);
    return message.reply("✨💖 Conversation toute propre ! (≧◡≦) ♡");
  } catch (error) {
    return message.reply("❌ Oupsie… impossible de reset (｡•́︿•̀｡)");
  }
};

/* 🎨 Image Edit – kawaii mode */
const handleEdit = async (api, event, message, args) => {
  const prompt = args.join(" ");
  if (!prompt)
    return message.reply("❗🌸 Mets un texte pour éditer ou générer, nya~");

  api.setMessageReaction("⏳", event.messageID, () => {}, true);
  try {
    const params = { prompt };
    if (event.messageReply?.attachments?.[0]?.url) {
      params.imgurl = event.messageReply.attachments[0].url;
    }

    const res = await axios.get(EDIT_API, { params });

    if (!res.data?.images?.[0])
      return message.reply("❌ L'image n’a pas voulu être cute aujourd’hui >_<");

    const base64Image = res.data.images[0].replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");

    const imagePath = path.join(TMP_DIR, `${Date.now()}.png`);
    fs.writeFileSync(imagePath, buffer);

    api.setMessageReaction("🌸", event.messageID, () => {}, true);
    await message.reply({ attachment: fs.createReadStream(imagePath) });
    fs.unlinkSync(imagePath);

  } catch (error) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return message.reply("⚠️ Erreur… *snif snif* (╥﹏╥)");
  }
};

/* 🎬 YouTube Downloader – cute edition */
const handleYouTube = async (api, event, message, args) => {
  const option = args[0];
  if (!["-v", "-a"].includes(option))
    return message.reply("❌ 🌸 Usage: Youtube [-v|-a] <search/url>");

  const query = args.slice(1).join(" ");
  if (!query) return message.reply("❗ Mets ce que tu veux chercher, sweetie~");

  const sendFile = async (url, type) => {
    try {
      const { data } = await axios.get(`${YT_API}?url=${encodeURIComponent(url)}&type=${type}`);

      const downloadUrl = data.download_url;
      if (!data.status || !downloadUrl)
        throw new Error("Kawaii API failed");

      const filePath = path.join(TMP_DIR, `yt_${Date.now()}.${type}`);
      const writer = fs.createWriteStream(filePath);
      const stream = await axios({ url: downloadUrl, responseType: "stream" });

      stream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.reply({ attachment: fs.createReadStream(filePath) });
      fs.unlinkSync(filePath);

    } catch (err) {
      message.reply(`❌ Impossible de télécharger ${type} (｡•́︿•̀｡)`);
    }
  };

  if (query.startsWith("http"))
    return await sendFile(query, option === "-v" ? "mp4" : "mp3");

  try {
    const results = (await ytSearch(query)).videos.slice(0, 6);
    if (results.length === 0)
      return message.reply("❌ Rien trouvé… triste TwT");

    let list = "🌸✨ Vidéos trouvées :\n";
    results.forEach((v, i) => {
      list += `${i + 1}. 🎬 ${v.title} (${v.timestamp})\n`;
    });

    const thumbs = await Promise.all(
      results.map(v =>
        axios.get(v.thumbnail, { responseType: "stream" }).then(res => res.data)
      )
    );

    api.sendMessage(
      { body: list + "\n✨ Réponds 1-6 pour télécharger 💖", attachment: thumbs },
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "ai",
          messageID: info.messageID,
          author: event.senderID,
          results,
          type: option
        });
      },
      event.messageID
    );

  } catch (err) {
    message.reply("❌ Désolée… YouTube fait la timide aujourd’hui (╥﹏╥)");
  }
};

/* 🧠 AI Main – aesthetic mode ON */
const handleAIRequest = async (api, event, userInput, message, isReply = false) => {
  const args = userInput.split(" ");
  const first = args[0]?.toLowerCase();

  if (["edit", "-e"].includes(first))
    return await handleEdit(api, event, message, args.slice(1));

  if (["youtube", "yt", "ytb"].includes(first))
    return await handleYouTube(api, event, message, args.slice(1));

  const userId = event.senderID;
  let messageContent = userInput;
  let imageUrl = null;

  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  const urlMatch = messageContent.match(/(https?:\/\/[^\s]+)/)?.[0];
  if (urlMatch && validUrl.isWebUri(urlMatch)) {
    imageUrl = urlMatch;
    messageContent = messageContent.replace(urlMatch, '').trim();
  }

  if (!messageContent && !imageUrl)
    return message.reply("💬 Mets un message cute ou une image ✨");

  try {
    const response = await axios.post(API_ENDPOINT, {
      uid: userId,
      message: messageContent,
      image_url: imageUrl
    });

    let finalReply = response.data.reply || "✨ Réponse kawaii :";

    // 🌸 Signature kawaii AESTHER
    finalReply = `🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞\n\n${finalReply}`;

    const attachments = [];
    if (response.data.image_url)
      attachments.push(fs.createReadStream(await downloadFile(response.data.image_url, 'jpg')));

    const sentMessage = await message.reply({
      body: finalReply,
      attachment: attachments.length ? attachments : undefined
    });

    global.GoatBot.onReply.set(sentMessage.messageID, {
      commandName: 'ai',
      messageID: sentMessage.messageID,
      author: userId
    });

    api.setMessageReaction("🌸", event.messageID, () => {}, true);

  } catch (error) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return message.reply("⚠️ Oupsie, erreur… mais je reste mignonne 💗");
  }
};

/* 🌸 EXPORT kawaii MODULE */
module.exports = {
  config: {
    name: 'ai-kawaii',
    version: '4.0.0',
    author: '🌸✨ AESTHER',
    role: 0,
    category: 'cute-ai',
    longDescription: {
      en: '🌸 Cute AI: chat, videos, editing… powered by aesthetic magic ✨'
    },
    guide: {
      en: `🌸 .ai <message> — parler à l'IA  
💖 .ai edit <prompt> — générer/éditer une image  
🎀 .ai youtube -v — vidéo  
🎶 .ai youtube -a — audio  
♻️ .ai clear — reset kawaii`
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const userInput = args.join(' ').trim();
    if (!userInput) return message.reply("❗🌸 Mets un message mignon");
    if (['clear', 'reset'].includes(userInput.toLowerCase()))
      return await resetConversation(api, event, message);
    return await handleAIRequest(api, event, userInput, message);
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) return;
    const userInput = event.body?.trim();
    if (!userInput) return;

    if (['clear', 'reset'].includes(userInput.toLowerCase()))
      return await resetConversation(api, event, message);

    if (Reply.results && Reply.type) {
      const num = parseInt(userInput);
      if (isNaN(num) || num < 1 || num > Reply.results.length)
        return message.reply("❌ Seulement 1 à 6 sweetie~");

      const selected = Reply.results[num - 1];
      const type = Reply.type === "-v" ? "mp4" : "mp3";
      const fileUrl = `${YT_API}?url=${encodeURIComponent(selected.url)}&type=${type}`;

      try {
        const { data } = await axios.get(fileUrl);
        const filePath = await downloadFile(data.download_url, type);
        await message.reply({ attachment: fs.createReadStream(filePath) });
        fs.unlinkSync(filePath);
      } catch {
        message.reply("❌ Impossible de télécharger TwT");
      }
    } else {
      return await handleAIRequest(api, event, userInput, message, true);
    }
  },

  onChat: async function ({ api, event, message }) {
    const body = event.body?.trim();
    if (!body?.toLowerCase().startsWith('ai ')) return;
    const userInput = body.slice(3).trim();
    if (!userInput) return;
    return await handleAIRequest(api, event, userInput, message);
  }
};
