const { MessageEmbed } = require('discord.js');
const { modLog } = require('../other/mod/functions.js');

module.exports = {
  name        : 'ban',
  aliases     : [],
  description : 'Ban a member from the Discord',
  args        : [
    {
      name: 'user',
      type: 'USER',
      description: 'The user to be banned',
      required: true,
    },
    {
      name: 'reason',
      type: 'STRING',
      description: 'The reason this user is being banned',
      required: false,
    },
  ],
  guildOnly   : true,
  cooldown    : 120,
  botperms    : ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
  userroles   : ['Moderator'],
  execute     : async (interaction) => {
    const id = interaction.options.get('user').value;
    const reason = interaction.options.get('reason')?.value;

    const member = await interaction.guild.members.fetch(id).catch(e => {});
    let user = member?.user;
    if (!member) {
      try {
        const kickInfo = await interaction.guild.members.ban(id);
        user = kickInfo?.user || kickInfo || {};
      } catch (e) {
        const embed = new MessageEmbed().setColor('#e74c3c').setDescription('Invalid user ID specified.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    if (member && member == interaction.guild.me) {
      modLog(interaction.guild,
        `**Mod:** ${interaction.member.toString()}
        **User:** ${member.toString()}
        **Action:** Attempted to ban the bot
        **Reason:** ${reason || 'Unknown'}`);
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription('You cannot ban me trainer!');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (member && member.roles.highest.position >= interaction.member.roles.highest.position) {
      modLog(interaction.guild,
        `**Mod:** ${interaction.member.toString()}
        **User:** ${member.toString()}
        **Action:** Attempted to ban user (failed as higher roles)
        **Reason:** ${reason || 'Unknown'}`);
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription('The user you tried to kick has higher or equal roles than you!');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const joinDiscord = new Date(user?.createdTimestamp);
    const joinServer = new Date(member?.joinedTimestamp);
    const embed = new MessageEmbed()
      .setTitle('USER BANNED')
      .setAuthor({
        name: user?.tag,
        url: `https://discordapp.com/users/${user?.id}`,
        iconURL: user?.displayAvatarURL?.(),
      })
      .setDescription(user?.toString?.())
      .setColor('RANDOM')
      .setThumbnail(user?.displayAvatarURL?.())
      .addField('Status:', member?.presence?.status || 'offline')
      .addField('Joined Discord:', `<t:${Math.floor(+joinDiscord / 1000)}:R>`)
      .addField('Joined Server:', `<t:${Math.floor(+joinServer / 1000)}:R>`)
      .setFooter({ text: `ID: ${user?.id}` })
      .setTimestamp();

    modLog(interaction.guild,
      `**Mod:** ${interaction.member.toString()}
      **User:** ${member?.toString?.() || user?.toString?.() || id}
      **Action:** User Banned
      **Reason:** ${reason || 'Unknown'}`);

    interaction.reply({ embeds: [embed], ephemeral: true });
    if (member) {
      member.ban({ days: 7, reason: reason || 'Unknown' });
    }
  },
};
