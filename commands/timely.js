const { MessageEmbed } = require('discord.js');
const { addAmount } = require('../database.js');
const { bonusRoles } = require('../config.js');
const {
  getLastClaim,
  updateClaimDate,
  bumpClaimStreak,
  resetClaimStreak,
  warn,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
} = require('../helpers.js');

const money_icon = '<:money:737206931759824918>';
const timelyAmount = 10;

const calcStreakBonus = (streak) => {
  const bigStreak = Math.max(0, Math.min(10, streak));
  streak -= bigStreak;
  const midStreak = Math.max(0, Math.min(50, streak));
  streak -= midStreak;
  return bigStreak + Math.floor(midStreak * 0.2) + Math.floor(streak * 0.05);
};

const s = (amt) => amt != 1 ? 's' : '';

module.exports = {
  name        : 'timely',
  aliases     : [],
  description : 'Claim your 2 hourly coins',
  args        : [],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES', 'EMBED_LINKS'],
  userperms   : ['SEND_MESSAGES'],
  channels    : ['game-corner', 'bot-commands'],
  execute     : async (msg, args) => {
    // Check if user claimed within the last 24 hours
    let { last_claim, streak } = await getLastClaim(msg.author, 'timely_claim');

    // User already claimed within last 2 hours
    if (last_claim >= (Date.now() - (2 * HOUR))) {
      const time_left = (+last_claim + (2 * HOUR)) - Date.now();
      const hours = Math.floor(time_left % DAY / HOUR);
      const minutes = Math.floor(time_left % HOUR / MINUTE);
      const seconds = Math.floor(time_left % MINUTE / SECOND);
      let timeRemaining = '';
      if (+hours) timeRemaining += `${hours} hour${s(hours)} `;
      if (+hours || +minutes) timeRemaining += `${minutes} minute${s(minutes)} `;
      timeRemaining += `${seconds} second${s(seconds)}`;
      return msg.channel.send({
        embed: new MessageEmbed().setColor('#e74c3c').setDescription(`${msg.author}\nYou've already claimed your <:money:737206931759824918> too recently\nYou can claim again in ${timeRemaining}`),
      });
    }

    // Should the claim streak be reset (if more than 1 day)
    if (last_claim < (Date.now() - (2 * DAY))) {
      await resetClaimStreak(msg.author, 'timely_claim');
      streak = 0;
    }

    // Calculate bonuses
    const streakBonus = calcStreakBonus(streak);
    let totalAmount = timelyAmount + streakBonus;
    const roleBonuses = [];
    try {
      msg.member.roles.cache.map(r => r.id).forEach(roleID => {
        const bonus = bonusRoles[roleID];
        if (bonus) {
          roleBonuses.push([roleID, Math.floor(totalAmount * bonus)]);
        }
      });
    } catch (e) {
      warn('something went wrong calculating role claim bonuses', e);
    }
    totalAmount += roleBonuses.reduce((a, [r, b]) => a + b, 0);

    // Add the coins to the users balance then set last claim time (incase the user doesn't exist yet)
    const balance = await addAmount(msg.author, totalAmount, 'coins');
    await updateClaimDate(msg.author, 'timely_claim');
    await bumpClaimStreak(msg.author, 'timely_claim');

    const message = [
      msg.author,
      `_Timely Claim:_ **+${timelyAmount.toLocaleString('en-US')}** ${money_icon}`,
    ];

    if (streakBonus) {
      message.push(`_Streak Bonus:_ **+${streakBonus.toLocaleString('en-US')}** ${money_icon} `);
    }

    roleBonuses.forEach(([r, b]) => {
      message.push(`_<@&${r}>:_ **+${b.toLocaleString('en-US')}** ${money_icon}`);
    });

    message.push(
      '',
      `Current Balance: **${balance.toLocaleString('en-US')}** ${money_icon}`,
      `Current Streak: **${streak + 1}**`
    );

    return msg.channel.send({
      embed: new MessageEmbed().setColor('#2ecc71').setDescription(message),
    });
  },
};
