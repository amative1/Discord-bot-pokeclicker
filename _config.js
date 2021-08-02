module.exports = {
  prefix: '!',
  token: 'YOUR_BOTS_TOKEN_HERE',
  // Image source website base
  website: 'https://LINK.TO.WEBSITE/',
  // Bot owner ID, used for eval and other commands
  ownerID: 'YOUR_DISCORD_USER_ID (optional)',
  // Channel where the backup database should be sent
  backupChannelID: 'DISCORD_BACKUP_CHANNEL_ID (optional)',
  quizChannelID: 'DISCORD_QUIZ_CHANNEL_ID (optional)',
  // Specific roles in the server
  mutedRoleID: '758167963294629898',
  externalScriptsRoleID: '761015248856809493',
  // Roles that get bonus coins (percentage gain)
  bonusRoles: {
    '751979566280605728': 0.2, // Poké Squad
    '736262806306947215': 0.5, // Server Booster
  },
  notificationRoles: [
    {
      id: '787144169176825856',
      name: 'Game Updates',
      emoji: '<:Pokeball:662909508284055553>',
    },
    {
      id: '787144107817959444',
      name: 'Bot Updates',
      emoji: '<:money:751765172523106377>',
    },
    {
      id: '788190728027242496',
      name: 'Happy Hour',
      emoji: '<:marsh_badge:785737862280249364>',
    },
  ],
  serverIcons: {
    money: '<:money:737206931759824918>',
  },
};
