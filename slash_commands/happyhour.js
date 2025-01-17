const { MessageEmbed } = require('discord.js');
const { HOUR } = require('../helpers.js');
const { happyHourHours } = require('../other/quiz/happy_hour.js');

module.exports = {
  name        : 'happyhour',
  aliases     : ['hh', 'happy-hour'],
  description : 'Check when the next happy hour is for #bot-coins',
  args        : [],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES', 'EMBED_LINKS'],
  userperms   : [],
  channels    : ['bot-coins', 'game-corner', 'bot-commands'],
  execute     : async (interaction) => {
    const now = Date.now();
    const happy_hour = new Date((now - (now % (happyHourHours * HOUR))) + happyHourHours * HOUR);
    
    const embed = new MessageEmbed()
      .setDescription('Next happy hour:')
      .setTimestamp(happy_hour)
      .setColor('#3498db');
    return interaction.reply({ embeds: [embed] });
  },
};
