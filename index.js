const fs = require('fs');
const { Client, GatewayIntentBits, Routes, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const puppeteer = require('puppeteer');
const config = require('./config.json');
const dataFile = 'data.json';
let data = require(`./${dataFile}`);
const serverConfigsFile = 'serverConfigs.json';
let serverConfigs = require(`./${serverConfigsFile}`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  {
    name: 'sendletter',
    description: 'Send a new letter 🍂',
    options: [
      {
        name: 'content',
        type: 3, // 'STRING' type
        description: 'The content of your letter 🍂',
        required: true,
      },
    ],
  },
  {
    name: 'vote',
    description: 'Vote for the bot to get extra privileges 🍂',
  },
  {
    name: 'setletterschannel',
    description: 'Set the channel where letters can be sent and received 🍂',
    options: [
      {
        name: 'channel',
        type: 7, // 'CHANNEL' type
        description: 'The channel to set for letters 🍂',
        required: true,
      },
    ],
  },
  {
    name: 'help',
    description: 'Get a list of all commands and their descriptions 🍂',
  },
  {
    name: 'gallery',
    description: 'View your saved letters 🍂',
  },
  {
    name: 'premium',
    description: 'Learn how to become a premium user 🍂',
  },
  {
    name: 'changetextcolor',
    description: 'Change the text color of your letters (premium users only) 🍂',
    options: [
      {
        name: 'color',
        type: 3, // 'STRING' type
        description: 'The hex code of the new text color 🍂',
        required: true,
      },
    ],
  },
  {
    name: 'changebgcolor',
    description: 'Change the background color of your letters (premium users only) 🍂',
    options: [
      {
        name: 'color',
        type: 3, // 'STRING' type
        description: 'The hex code of the new background color 🍂',
        required: true,
      },
    ],
  },
  {
    name: 'resettextcolor',
    description: 'Reset the text color of your letters to default (premium users only) 🍂',
  },
  {
    name: 'resetletterbg',
    description: 'Reset the letter background to default color and remove image (premium users only) 🍂',
  },
  {
    name: 'givepremium',
    description: 'Give a user premium status (owner only) 🍂',
    options: [
      {
        name: 'user',
        type: 6, // 'USER' type
        description: 'The user to give premium status',
        required: true,
      },
    ],
  },
  {
    name: 'changegallerybg',
    description: 'Change the gallery background image (premium users only) 🍂',
    options: [
      {
        name: 'image',
        type: 11, // 'ATTACHMENT' type
        description: 'The new background image for your gallery 🍂',
        required: true,
      },
    ],
  },
  {
    name: 'changeletterbg',
    description: 'Change the letter background image (premium users only) 🍂',
    options: [
      {
        name: 'image',
        type: 11, // 'ATTACHMENT' type
        description: 'The new background image for your letter (1160x1447 preferred) 🍂',
        required: true,
      },
    ],
  },
  {
    name: 'changegallerycolor',
    description: 'Change the gallery background color (premium users only) 🍂',
    options: [
      {
        name: 'color',
        type: 3, // 'STRING' type
        description: 'The hex code of the new background color for your gallery 🍂',
        required: true,
      },
    ],
  },
  {
    name: 'resetgallerybg',
    description: 'Reset the gallery background to default (premium users only) 🍂',
  },
  {
    name: 'language',
    description: 'Change the bot language 🍂',
    options: [
      {
        name: 'language',
        type: 3, // 'STRING' type
        description: 'The language to switch to (English or German) 🍂',
        required: true,
        choices: [
          { name: 'English', value: 'en' },
          { name: 'German', value: 'de' },
        ],
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands. 🍂');
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log('Successfully reloaded application (/) commands. 🍂');
  } catch (error) {
    console.error(error);
  }
})();

function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function saveServerConfigs() {
  fs.writeFileSync(serverConfigsFile, JSON.stringify(serverConfigs, null, 2));
}

const whitelistedServers = ['333949691962195969', '1249664604037054464'];

function isPremium(userID, guildID) {
  return data.users[userID]?.premium === true || whitelistedServers.includes(guildID);
}

function isOwner(userID) {
  return userID === config.ownerID;
}

const messages = {
  en: {
    noLettersChannel: 'No letters channel set. Please set a letters channel first using /setletterschannel. 🍂',
    lettersChannelOnly: 'Letters can only be sent in the designated letters channel. 🍂',
    cooldown: hours => `You can only send one letter every ${hours} hours. Vote on top.gg to send more! 🍂`,
    letterTooLong: maxLength => `Your letter is too long. Please keep it under ${maxLength} characters. 🍂`,
    letterSent: 'Your letter has been sent! 🍂',
    thankYouForVoting: 'Thank you for voting! You can now send letters without cooldown for the next 24 hours. 🍂',
    newLetter: 'Look! A new letter from an anonymous sender! 🍂',
    premiumFeature: 'You\'ve discovered a Premium Feature! Premium allows you to see who sent you this letter and so much more. Try /premium',
    maxGalleryReached: 'You have reached the maximum number of letters in your gallery. Upgrade to premium for unlimited gallery space! 🍂',
    lettersChannelSet: channelName => `Letters channel has been set to ${channelName}. 🍂`,
    helpMessage: `
**List of Commands:**
- **/sendletter [content]**: Send a new letter 🍂
- **/vote**: Vote for the bot to get extra privileges 🍂
- **/setletterschannel [channel]**: Set the channel where letters can be sent and received 🍂
- **/help**: Get a list of all commands and their descriptions 🍂
- **/gallery**: View your saved letters 🍂
- **/premium**: Learn how to become a premium user 🍂
- **/changetextcolor [hexcode]**: Change the text color of your letters (premium users only) 🍂
- **/changebgcolor [hexcode]**: Change the background color of your letters (premium users only) 🍂
- **/resettextcolor**: Reset the text color of your letters to default (premium users only) 🍂
- **/resetletterbg**: Reset the letter background to default color and remove image (premium users only) 🍂
- **/givepremium [user]**: Give a user premium status (owner only) 🍂
- **/changegallerybg [image]**: Change the gallery background image (premium users only) 🍂
- **/changeletterbg [image]**: Change the letter background image (premium users only) 🍂
- **/changegallerycolor [hexcode]**: Change the background color of the gallery (premium users only) 🍂
- **/resetgallerybg**: Reset the gallery background to default (premium users only) 🍂
    `,
    becomePremium: 'Join our server https://discord.gg/miauwelt and message us and we will tell you how to become a premium user! 🍂',
    textColorChanged: color => `Your text color has been changed to ${color}! 🍂`,
    backgroundColorChanged: color => `Your background color has been changed to ${color}! 🍂`,
    textColorReset: 'Your text color has been reset to default! 🍂',
    backgroundColorReset: 'Your background color has been reset to default! 🍂',
    premiumGranted: userTag => `${userTag} has been given premium status! 🍂`,
    galleryEmpty: 'Your gallery is empty. Save letters with 🍂 reaction. 🍂',
    letterDeleted: 'Letter deleted from your gallery. 🍂',
    replySent: 'Your reply has been sent! 🍂',
    replyTimeout: 'Reply timed out. 🍂',
    letterSaved: 'Letter saved to your gallery! 🍂',
    letterAlreadyInGallery: 'This letter is already in your gallery. 🍂',
    letterReplyPrompt: 'Please type your reply as a reply to the letter (not to this message): 🍂',
    letterTooLongReply: maxLength => `Your reply is too long. Please keep it under ${maxLength} characters. 🍂`,
    letterAlreadyReplied: 'This letter has already been replied to. 🍂',
    errorSendingReply: 'There was an error sending your reply. 🍂',
    letterSenderInfo: (senderTag, timestamp) => `This letter was sent by ${senderTag} at ${timestamp}. I'm sure they're great! 🍂`,
    languageSet: language => `Bot language has been set to ${language === 'en' ? 'English' : 'German'} 🍂`,
    onlyAdmin: 'Only server admins can use this command. 🍂',
    invalidColor: 'Invalid color code. Please provide a valid hex code. 🍂',
    galleryBackgroundChanged: 'Your gallery background image has been changed! 🍂',
    letterBackgroundChanged: 'Your letter background image has been changed! 🍂',
    galleryBackgroundReset: 'Your gallery background has been reset to default! 🍂',
    deleteConfirmation: 'Are you sure you want to delete this letter? React with ✅ to confirm or ❌ to cancel. 🍂',
    deletionCancelled: 'Letter deletion cancelled. 🍂',
    letterCannotDelete: 'You cannot delete someone else\'s letter. 🍂',
    cannotNavigate: 'You cannot navigate someone else\'s gallery. 🍂',
  },
  de: {
    noLettersChannel: 'Kein Briefkanal festgelegt. Bitte richten Sie zuerst einen Briefkanal mit /setletterschannel ein. 🍂',
    lettersChannelOnly: 'Briefe können nur im vorgesehenen Briefkanal gesendet werden. 🍂',
    cooldown: hours => `Sie können nur alle ${hours} Stunden einen Brief senden. Voten Sie auf top.gg, um mehr zu senden! 🍂`,
    letterTooLong: maxLength => `Ihr Brief ist zu lang. Bitte halten Sie ihn unter ${maxLength} Zeichen. 🍂`,
    letterSent: 'Ihr Brief wurde gesendet! 🍂',
    thankYouForVoting: 'Danke für Ihre Stimme! Sie können jetzt 24 Stunden lang ohne Cooldown Briefe senden. 🍂',
    newLetter: 'Schau mal! Ein neuer Brief von einem anonymen Absender! 🍂',
    premiumFeature: 'Sie haben eine Premium-Funktion entdeckt! Premium ermöglicht es Ihnen, zu sehen, wer Ihnen diesen Brief geschickt hat, und vieles mehr. Probieren Sie /premium',
    maxGalleryReached: 'Sie haben die maximale Anzahl von Briefen in Ihrer Galerie erreicht. Upgraden Sie zu Premium für unbegrenzten Galeriespeicherplatz! 🍂',
    lettersChannelSet: channelName => `Briefkanal wurde auf ${channelName} gesetzt. 🍂`,
    helpMessage: `
**Liste der Befehle:**
- **/sendletter [content]**: Senden Sie einen neuen Brief 🍂
- **/vote**: Stimmen Sie für den Bot, um zusätzliche Privilegien zu erhalten 🍂
- **/setletterschannel [channel]**: Legen Sie den Kanal fest, in dem Briefe gesendet und empfangen werden können 🍂
- **/help**: Erhalten Sie eine Liste aller Befehle und deren Beschreibungen 🍂
- **/gallery**: Sehen Sie Ihre gespeicherten Briefe an 🍂
- **/premium**: Erfahren Sie, wie Sie Premium-Benutzer werden 🍂
- **/changetextcolor [hexcode]**: Ändern Sie die Textfarbe Ihrer Briefe (nur für Premium-Benutzer) 🍂
- **/changebgcolor [hexcode]**: Ändern Sie die Hintergrundfarbe Ihrer Briefe (nur für Premium-Benutzer) 🍂
- **/resettextcolor**: Setzen Sie die Textfarbe Ihrer Briefe auf Standard zurück (nur für Premium-Benutzer) 🍂
- **/resetletterbg**: Setzen Sie den Briefhintergrund auf die Standardfarbe zurück und entfernen Sie das Bild (nur für Premium-Benutzer) 🍂
- **/givepremium [user]**: Geben Sie einem Benutzer den Premium-Status (nur für Besitzer) 🍂
- **/changegallerybg [image]**: Ändern Sie das Galeriebild im Hintergrund (nur für Premium-Benutzer) 🍂
- **/changeletterbg [image]**: Ändern Sie das Briefhintergrundbild (nur für Premium-Benutzer) 🍂
- **/changegallerycolor [hexcode]**: Ändern Sie die Hintergrundfarbe der Galerie (nur für Premium-Benutzer) 🍂
- **/resetgallerybg**: Setzen Sie den Galeriehintergrund auf Standard zurück (nur für Premium-Benutzer) 🍂
    `,
    becomePremium: 'Treten Sie unserem Server bei https://discord.gg/miauwelt und senden Sie uns eine Nachricht, wir werden Ihnen sagen, wie Sie Premium-Benutzer werden können! 🍂',
    textColorChanged: color => `Ihre Textfarbe wurde auf ${color} geändert! 🍂`,
    backgroundColorChanged: color => `Ihre Hintergrundfarbe wurde auf ${color} geändert! 🍂`,
    textColorReset: 'Ihre Textfarbe wurde auf Standard zurückgesetzt! 🍂',
    backgroundColorReset: 'Ihre Hintergrundfarbe wurde auf Standard zurückgesetzt! 🍂',
    premiumGranted: userTag => `${userTag} hat den Premium-Status erhalten! 🍂`,
    galleryEmpty: 'Ihre Galerie ist leer. Speichern Sie Briefe mit 🍂 Reaktion. 🍂',
    letterDeleted: 'Brief aus Ihrer Galerie gelöscht. 🍂',
    replySent: 'Ihre Antwort wurde gesendet! 🍂',
    replyTimeout: 'Antwortzeit abgelaufen. 🍂',
    letterSaved: 'Brief in Ihrer Galerie gespeichert! 🍂',
    letterAlreadyInGallery: 'Dieser Brief befindet sich bereits in Ihrer Galerie. 🍂',
    letterReplyPrompt: 'Bitte schreiben Sie Ihre Antwort als Antwort auf den Brief (nicht auf diese Nachricht): 🍂',
    letterTooLongReply: maxLength => `Ihre Antwort ist zu lang. Bitte halten Sie sie unter ${maxLength} Zeichen. 🍂`,
    letterAlreadyReplied: 'Dieser Brief wurde bereits beantwortet. 🍂',
    errorSendingReply: 'Beim Senden Ihrer Antwort ist ein Fehler aufgetreten. 🍂',
    letterSenderInfo: (senderTag, timestamp) => `Dieser Brief wurde von ${senderTag} am ${timestamp} gesendet. Ich bin sicher, ${senderTag} ist großartig! 🍂`,
    languageSet: language => `Die Sprache des Bots wurde auf ${language === 'en' ? 'Englisch' : 'Deutsch'} gesetzt. 🍂`,
    onlyAdmin: 'Nur Server-Admins können diesen Befehl verwenden. 🍂',
    invalidColor: 'Ungültiger Farbcode. Bitte geben Sie einen gültigen Hex-Code an. 🍂',
    galleryBackgroundChanged: 'Ihr Galeriebild im Hintergrund wurde geändert! 🍂',
    letterBackgroundChanged: 'Ihr Briefhintergrundbild wurde geändert! 🍂',
    galleryBackgroundReset: 'Ihr Galeriehintergrund wurde auf Standard zurückgesetzt! 🍂',
    deleteConfirmation: 'Möchten Sie diesen Brief wirklich löschen? Reagieren Sie mit ✅, um zu bestätigen, oder mit ❌, um abzubrechen. 🍂',
    deletionCancelled: 'Brieflöschung abgebrochen. 🍂',
    letterCannotDelete: 'Sie können den Brief einer anderen Person nicht löschen. 🍂',
    cannotNavigate: 'Sie können nicht durch die Galerie einer anderen Person navigieren. 🍂',
  }
};

function getMessage(guildId, key, ...args) {
  const language = serverConfigs.servers[guildId]?.language || 'en';
  return typeof messages[language][key] === 'function' ? messages[language][key](...args) : messages[language][key];
}

client.once('ready', () => {
  console.log('Ready! 🍂');
  client.user.setPresence({
    activities: [{ name: 'May your paths cross again. 🍂' }],
    status: 'idle',
  });
});

client.login(config.token);

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  console.log(`Received command: ${interaction.commandName}`); // Debugging

  const { commandName, options, guildId, user } = interaction;

  if (commandName === 'sendletter') {
    const serverConfig = serverConfigs.servers[guildId];

    if (!serverConfig || !serverConfig.lettersChannelId) {
      await interaction.reply(getMessage(guildId, 'noLettersChannel'));
      return;
    }

    const userID = user.id;
    const now = new Date();

    if (interaction.channelId !== serverConfig.lettersChannelId) {
      await interaction.reply(getMessage(guildId, 'lettersChannelOnly'));
      return;
    }

    if (userID !== config.allowedUserId && !isOwner(userID) &&
      data.users[userID] &&
      new Date(data.users[userID].lastMessageTimestamp).getTime() + config.cooldownHours * 60 * 60 * 1000 > now.getTime() &&
      !data.users[userID].voted && !isPremium(userID, guildId)) {
      await interaction.reply(getMessage(guildId, 'cooldown', config.cooldownHours));
      return;
    }

    let letterContent = options.getString('content');
    const maxLength = isPremium(userID, guildId) ? 800 : 200;

    if (letterContent.length > maxLength) {
      await interaction.reply(getMessage(guildId, 'letterTooLong', maxLength));
      return;
    }

    if (!data.users[userID]) {
      data.users[userID] = { lastMessageTimestamp: now.toISOString(), voted: false, gallery: [], textColor: config.textColor, backgroundColor: config.backgroundColor };
    }

    await interaction.deferReply();

    const textColor = isPremium(userID, guildId) && data.users[userID].textColor ? data.users[userID].textColor : config.textColor;
    const backgroundColor = isPremium(userID, guildId) && data.users[userID].backgroundColor ? data.users[userID].backgroundColor : config.backgroundColor;

    const letterPath = await createLetterImage(letterContent, userID, now, textColor, backgroundColor, data.users[userID]?.letterBackground);

    const receiverID = 'someReceiverID'; // logic to select a random receiver
    data.letters.push({
      sender: userID,
      receiver: receiverID,
      content: letterPath,
      timestamp: now.toISOString(),
      replied: false,
      messageId: null,
      originServerId: guildId,
      originLanguage: serverConfigs.servers[guildId]?.language || 'en'
    });

    data.users[userID].lastMessageTimestamp = now.toISOString();

    saveData();

    const eligibleServers = Object.keys(serverConfigs.servers).filter(serverId => serverId !== guildId);
    if (eligibleServers.length === 0) {
      await interaction.editReply(getMessage(guildId, 'letterSent'));
      return;
    }
    const randomServerId = eligibleServers[Math.floor(Math.random() * eligibleServers.length)];
    const randomServerConfig = serverConfigs.servers[randomServerId];

    try {
      const attachment = new AttachmentBuilder(letterPath);
      const channel = await client.channels.fetch(randomServerConfig.lettersChannelId);
      const sentMessage = await channel.send({ content: getMessage(randomServerId, 'newLetter'), files: [attachment] });

      await sentMessage.react('🖋️');
      await sentMessage.react('🔍');
      await sentMessage.react('🍂');

      const letterIndex = data.letters.findIndex(l => l.content === letterPath);
      if (letterIndex !== -1) {
        data.letters[letterIndex].messageId = sentMessage.id;
        saveData();
      }

      await interaction.editReply(getMessage(guildId, 'letterSent'));
    } catch (error) {
      console.error(`Error sending letter to random server: ${error}`);
      await interaction.editReply(getMessage(guildId, 'errorSendingReply'));
    }
  }

  if (commandName === 'vote') {
    const userID = user.id;

    data.users[userID].voted = true;
    saveData();

    await interaction.reply(getMessage(guildId, 'thankYouForVoting'));
  }

  if (commandName === 'setletterschannel') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply(getMessage(interaction.guildId, 'onlyAdmin')); // Changed to interaction.guildId
      return;
    }

    const channel = options.getChannel('channel');
    const guildId = interaction.guildId; // Ensure this line is present and correct

    if (!serverConfigs.servers[guildId]) {
      serverConfigs.servers[guildId] = {};
    }

    serverConfigs.servers[guildId].lettersChannelId = channel.id;
    saveServerConfigs();

    await interaction.reply(getMessage(guildId, 'lettersChannelSet', channel.name));
  }

  if (commandName === 'help') {
    await interaction.reply(getMessage(guildId, 'helpMessage'));
  }

  if (commandName === 'premium') {
    await interaction.reply(getMessage(guildId, 'becomePremium'));
  }

  if (commandName === 'changetextcolor') {
    const userID = user.id;
    const color = options.getString('color');

    if (!isPremium(userID, guildId)) {
      await interaction.reply(getMessage(guildId, 'premiumFeature'));
      return;
    }

    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      await interaction.reply(getMessage(guildId, 'invalidColor'));
      return;
    }

    if (!data.users[userID]) {
      data.users[userID] = { premium: true, gallery: [], textColor: color };
    } else {
      data.users[userID].textColor = color;
    }

    saveData();
    await interaction.reply(getMessage(guildId, 'textColorChanged', color));
  }

  if (commandName === 'changebgcolor') {
    const userID = user.id;
    const color = options.getString('color');

    if (!isPremium(userID, guildId)) {
      await interaction.reply(getMessage(guildId, 'premiumFeature'));
      return;
    }

    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      await interaction.reply(getMessage(guildId, 'invalidColor'));
      return;
    }

    if (!data.users[userID]) {
      data.users[userID] = { premium: true, gallery: [], backgroundColor: color };
    } else {
      data.users[userID].backgroundColor = color;
    }

    saveData();
    await interaction.reply(getMessage(guildId, 'backgroundColorChanged', color));
  }

  if (commandName === 'resettextcolor') {
    const userID = user.id;

    if (!isPremium(userID, guildId)) {
      await interaction.reply(getMessage(guildId, 'premiumFeature'));
      return;
    }

    if (data.users[userID]) {
      delete data.users[userID].textColor;
    }

    saveData();
    await interaction.reply(getMessage(guildId, 'textColorReset'));
  }

  if (commandName === 'resetletterbg') {
    const userID = user.id;

    if (!isPremium(userID, guildId)) {
      await interaction.reply(getMessage(guildId, 'premiumFeature'));
      return;
    }

    if (data.users[userID]) {
      delete data.users[userID].backgroundColor;
      delete data.users[userID].letterBackground;
    }

    saveData();
    await interaction.reply(getMessage(guildId, 'backgroundColorReset'));
  }

  if (commandName === 'givepremium') {
    if (!isOwner(user.id)) {
      await interaction.reply('Only the bot owner can use this command. 🍂');
      return;
    }

    const userToGivePremium = options.getUser('user');

    if (!data.users[userToGivePremium.id]) {
      data.users[userToGivePremium.id] = { premium: true, gallery: [] };
    } else {
      data.users[userToGivePremium.id].premium = true;
    }

    saveData();
    await interaction.reply(getMessage(guildId, 'premiumGranted', userToGivePremium.tag));
  }

  if (commandName === 'gallery') {
    const userID = interaction.user.id;
    const userGallery = data.users[userID]?.gallery || [];

    if (userGallery.length === 0) {
      await interaction.reply(getMessage(guildId, 'galleryEmpty'));
      return;
    }

    await interaction.deferReply();

    const galleryPages = await createGalleryPages(userGallery, userID);

    const maxLettersPerPage = 4; // 4 letters per page
    const totalPages = Math.ceil(userGallery.length / maxLettersPerPage);

    let currentPage = 0;

    async function sendGalleryPage(pageNumber) {
      const attachment = new AttachmentBuilder(galleryPages[pageNumber]);
      const galleryMessage = await interaction.channel.send({ files: [attachment] });

      const reactionEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].slice(0, userGallery.slice(pageNumber * maxLettersPerPage, (pageNumber + 1) * maxLettersPerPage).length);
      for (let emoji of reactionEmojis) {
        await galleryMessage.react(emoji);
      }

      if (totalPages > 1) {
        await galleryMessage.react('🍂');
      }

      setupReactionCollector(galleryMessage, pageNumber, interaction.user.id);
      return galleryMessage;
    }

    function setupReactionCollector(galleryMessage, currentPage, userId) {
      const filter = (reaction, user) => !user.bot && user.id === userId;
      const collector = galleryMessage.createReactionCollector({ filter, time: 60000 });

      collector.on('collect', async (reaction, user) => {
        const userID = user.id;

        if (reaction.emoji.name === '🍂') {
          currentPage = (currentPage + 1) % totalPages;
          await galleryMessage.delete();
          galleryMessage = await sendGalleryPage(currentPage);
        } else {
          const selectedNumber = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].indexOf(reaction.emoji.name);
          if (selectedNumber !== -1) {
            const selectedLetterIndex = selectedNumber + (currentPage * maxLettersPerPage);
            if (selectedLetterIndex < userGallery.length) {
              const letterPath = userGallery[selectedLetterIndex];
              const letterAttachment = new AttachmentBuilder(letterPath);

              const letterMessage = await interaction.followUp({ files: [letterAttachment] });
              await letterMessage.react('🍂');
              await letterMessage.react('🚮');

              const letterFilter = (reaction, user) => ['🍂', '🚮'].includes(reaction.emoji.name) && !user.bot && user.id === interaction.user.id;
              const letterCollector = letterMessage.createReactionCollector({ filter: letterFilter, time: 60000 });

              letterCollector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '🚮') {
                  await letterMessage.reply(getMessage(guildId, 'deleteConfirmation'));

                  const confirmationFilter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
                  const confirmationCollector = letterMessage.createReactionCollector({ filter: confirmationFilter, max: 1, time: 30000 });

                  confirmationCollector.on('collect', async (reaction) => {
                    if (reaction.emoji.name === '✅') {
                      const letterIndex = userGallery.indexOf(letterPath);
                      if (letterIndex !== -1) {
                        userGallery.splice(letterIndex, 1);
                        data.users[userID].gallery = userGallery;
                        saveData();
                        await letterMessage.delete();
                        await interaction.followUp(getMessage(guildId, 'letterDeleted'));
                      }
                    } else {
                      await interaction.followUp(getMessage(guildId, 'deletionCancelled'));
                    }
                  });

                  confirmationCollector.on('end', collected => {
                    if (collected.size === 0) {
                      interaction.followUp(getMessage(guildId, 'deletionCancelled'));
                    }
                  });

                  await letterMessage.react('✅');
                  await letterMessage.react('❌');
                } else if (reaction.emoji.name === '🍂') {
                  await letterMessage.delete();
                  const newAttachment = new AttachmentBuilder(galleryPages[currentPage]);
                  await interaction.followUp({ files: [newAttachment] });
                  galleryMessage = await sendGalleryPage(currentPage);
                }
              });
            }
          }
        }
      });

      collector.on('end', collected => {
        console.log(`Collected ${collected.size} reactions.`);
      });
    }

    let galleryMessage = await sendGalleryPage(currentPage);
  }

  if (commandName === 'language') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply(getMessage(guildId, 'onlyAdmin'));
      return;
    }

    const language = options.getString('language');

    if (!serverConfigs.servers[guildId]) {
      serverConfigs.servers[guildId] = {};
    }

    serverConfigs.servers[guildId].language = language;
    saveServerConfigs();

    await interaction.reply(getMessage(guildId, 'languageSet', language));
  }

  if (commandName === 'changegallerybg') {
    const userID = user.id;

    if (!isPremium(userID, guildId)) {
      await interaction.reply(getMessage(guildId, 'premiumFeature'));
      return;
    }

    const attachment = options.getAttachment('image');

    if (!data.users[userID]) {
      data.users[userID] = { premium: true, galleryBackground: attachment.url };
    } else {
      data.users[userID].galleryBackground = attachment.url;
    }

    saveData();
    await interaction.reply(getMessage(guildId, 'galleryBackgroundChanged'));
  }

  if (commandName === 'changeletterbg') {
    const userID = user.id;

    if (!isPremium(userID, guildId)) {
      await interaction.reply(getMessage(guildId, 'premiumFeature'));
      return;
    }

    const attachment = options.getAttachment('image');

    if (!data.users[userID]) {
      data.users[userID] = { premium: true, letterBackground: attachment.url };
    } else {
      data.users[userID].letterBackground = attachment.url;
    }

    saveData();
    await interaction.reply(getMessage(guildId, 'letterBackgroundChanged'));
  }

  if (commandName === 'resetgallerybg') {
    const userID = user.id;

    if (!isPremium(userID, guildId)) {
      await interaction.reply(getMessage(guildId, 'premiumFeature'));
      return;
    }

    if (data.users[userID]) {
      delete data.users[userID].galleryBackground;
      delete data.users[userID].galleryBackgroundColor;
    }

    saveData();
    await interaction.reply(getMessage(guildId, 'galleryBackgroundReset'));
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (!user.bot) {
    const guildId = reaction.message.guildId;
    const serverConfig = serverConfigs.servers[guildId];

    if (!serverConfig || !serverConfig.lettersChannelId) return;

    const userID = user.id;
    const message = reaction.message;

    if (message.channelId !== serverConfig.lettersChannelId) {
      return;
    }

    const letter = data.letters.find(l => l.messageId === message.id);

    if (!letter) {
      return;
    }

    const originLanguage = letter.originLanguage || 'en';

    if (reaction.emoji.name === '🖋️') {
      if (letter.replied) {
        message.channel.send(getMessage(guildId, 'letterAlreadyReplied'));
        return;
      }

      const filter = response => response.author.id === userID && response.reference && response.reference.messageId === message.id;
      const replyCollector = message.channel.createMessageCollector({ filter, time: 300000 });

      message.channel.send(getMessage(guildId, 'letterReplyPrompt'));

      replyCollector.on('collect', async reply => {
        const maxLength = isPremium(userID, guildId) ? 800 : 200;

        if (reply.content.length > maxLength) {
          await reply.reply(getMessage(guildId, 'letterTooLongReply', maxLength));
          return;
        }

        console.log(`Collected reply: ${reply.content}`);
        try {
          const replyPath = await createLetterImage(reply.content, userID, new Date(), config.textColor, config.backgroundColor, data.users[userID]?.letterBackground);
          console.log(`Reply image created at path: ${replyPath}`);

          data.letters.push({
            sender: userID,
            receiver: letter.sender,
            content: replyPath,
            timestamp: new Date().toISOString(),
            replied: false,
            messageId: null,
            originServerId: letter.originServerId,
            originLanguage: serverConfigs.servers[guildId]?.language || 'en'
          });

          letter.replied = true;
          saveData();

          const targetServerId = letter.originServerId === guildId ? letter.senderServerId : letter.originServerId;
          const targetServerConfig = serverConfigs.servers[targetServerId];

          try {
            const replyChannel = await client.channels.fetch(targetServerConfig.lettersChannelId);
            const replyAttachment = new AttachmentBuilder(replyPath);
            const sentReplyMessage = await replyChannel.send({ content: getMessage(targetServerId, 'newLetter'), files: [replyAttachment] });

            await sentReplyMessage.react('🖋️');
            await sentReplyMessage.react('🔍');
            await sentReplyMessage.react('🍂');

            const replyIndex = data.letters.findIndex(l => l.content === replyPath);
            if (replyIndex !== -1) {
              data.letters[replyIndex].messageId = sentReplyMessage.id;
              data.letters[replyIndex].senderServerId = guildId;
              saveData();
            }

            message.channel.send(getMessage(guildId, 'replySent'));
            replyCollector.stop();
          } catch (error) {
            console.error(`Error sending reply to target server: ${error}`);
            message.channel.send(getMessage(guildId, 'errorSendingReply'));
          }
        } catch (error) {
          console.error(`Error creating or sending reply image: ${error}`);
          message.channel.send(getMessage(guildId, 'errorSendingReply'));
        }
      });

      replyCollector.on('end', collected => {
        if (collected.size === 0) {
          message.channel.send(getMessage(guildId, 'replyTimeout'));
        }
      });
    } else if (reaction.emoji.name === '🍂') {
      if (!data.users[userID]) {
        data.users[userID] = { gallery: [] };
      }
      const userGallery = data.users[userID].gallery || [];
      if (!userGallery.includes(letter.content)) {
        if (!isPremium(userID, guildId) && userGallery.length >= 20) {
          message.channel.send(getMessage(guildId, 'maxGalleryReached'));
          return;
        }
        userGallery.push(letter.content);
        data.users[userID].gallery = userGallery;
        saveData();
        message.channel.send(getMessage(guildId, 'letterSaved'));
      } else {
        message.channel.send(getMessage(guildId, 'letterAlreadyInGallery'));
      }
    } else if (reaction.emoji.name === '🔍') {
      if (!isPremium(userID, guildId)) {
        message.channel.send(getMessage(guildId, 'premiumFeature'));
        return;
      }

      const sender = await client.users.fetch(letter.sender);
      const timestamp = new Date(letter.timestamp).toLocaleString();

      message.channel.send(getMessage(guildId, 'letterSenderInfo', sender.tag, timestamp));
    }
  }
});

async function createLetterImage(content, userID, now, textColor, backgroundColor, backgroundImage) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  function insertLineBreaks(text, maxLineLength) {
    let result = '';
    while (text.length > 0) {
      result += text.substring(0, maxLineLength) + '<br>';
      text = text.substring(maxLineLength);
    }
    return result;
  }

  // Format the content with line breaks
  const formattedContent = insertLineBreaks(content, 30);

  const htmlContent = `
    <html>
    <head>
      <style>
        body {
          width: 1160px;
          height: 1447px;
          background-color: ${backgroundColor};
          ${backgroundImage ? `background-image: url('${backgroundImage}'); background-size: cover; background-position: center;` : ''}
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px;
          box-sizing: border-box;
          font-family: 'Handwritten', sans-serif;
          color: ${textColor};
          position: relative;
          text-align: center;
        }
        .background-element {
          position: absolute;
          width: 50px;
          height: 50px;
          background-image: url('${config.backgroundElementPath}');
          background-size: cover;
          opacity: 0.5;
        }
        .content {
          z-index: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          height: auto;
          text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
          font-size: 30px;
          line-height: 1.5;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          padding: 20px;
          box-sizing: border-box;
          overflow: visible;
        }
      </style>
    </head>
    <body>
      ${generateRandomElements()}
      <div class="content">
        ${formattedContent.replace(/\n/g, '<br>')}
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  await page.setViewport({ width: 1160, height: 1447 });

  const screenshotBuffer = await page.screenshot({ type: 'png' });
  await browser.close();

  const letterPath = `letters/${userID}-${now.getTime()}.png`;
  fs.writeFileSync(letterPath, screenshotBuffer);

  console.log(`Letter image created at path: ${letterPath}`);

  return letterPath;
}

async function createGalleryPages(gallery, userID) {
  const maxLettersPerPage = 4; // 4 letters per page
  const pageCount = Math.ceil(gallery.length / maxLettersPerPage);
  const pages = [];

  const browser = await puppeteer.launch();

  for (let i = 0; i < pageCount; i++) {
    const page = await browser.newPage();

    let galleryContent = `
      <html>
      <head>
        <style>
          body {
            width: 1336px;
            height: 1002px;
            background-color: ${data.users[userID]?.galleryBackgroundColor || '#c4b69e'};
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            padding: 30px;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
            color: #fff;
            position: relative;
            background-image: url('${data.users[userID]?.galleryBackground || ''}');
            background-size: cover;
            background-position: center;
          }
          .letter {
            width: calc(40% - 40px); /* Adjust width for 2 columns */
            height: calc(40% - 40px); /* Adjust height for 2 rows */
            margin: 20px;
            border: 2px solid #fff;
            border-radius: 15px;
            box-shadow: 0px 0px 15px rgba(0,0,0,0.2);
            overflow: hidden;
            background-color: #e4d5b7;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .letter img {
            max-width: 100%;
            max-height: 100%;
            object-fit: cover;
          }
        </style>
      </head>
      <body>
    `;

    const start = i * maxLettersPerPage;
    const end = Math.min(start + maxLettersPerPage, gallery.length);

    for (let j = start; j < end; j++) {
      galleryContent += `<div class="letter"><img src="data:image/png;base64,${fs.readFileSync(gallery[j]).toString('base64')}" /></div>`;
    }

    galleryContent += `
      </body>
      </html>
    `;

    await page.setContent(galleryContent);
    await page.setViewport({ width: 1336, height: 1002 });

    const galleryBuffer = await page.screenshot({ type: 'png' });
    const galleryPath = `galleries/${userID}-gallery-page-${i + 1}.png`;
    fs.writeFileSync(galleryPath, galleryBuffer);

    console.log(`Gallery image created at path: ${galleryPath}`);

    pages.push(galleryPath);

    await page.close();
  }

  await browser.close();

  return pages;
}

function generateRandomElements() {
  const elementsCount = Math.floor(Math.random() * (config.elementMaxCount - config.elementMinCount + 1)) + config.elementMinCount;
  let elements = '';
  for (let i = 0; i < elementsCount; i++) {
    const x = Math.random() * 1110 + 25;
    const y = Math.random() * 1397 + 25;
    const scale = Math.random() * (config.elementMaxScale - config.elementMinScale) + config.elementMinScale;
    elements += `<div class="background-element" style="top: ${y}px; left: ${x}px; transform: scale(${scale});"></div>`;
  }
  return elements;
}
