const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

const ALLOWED_USERS = ['533339674173767682', '810198568845049886'];
const ANNOUNCE_CHANNEL_ID = '1355906365679206420';

const roles = [
  '1383042623354179664', '1382766397263974491', '1383042873615978546',
  '1355904538128814263', '1355904464661516438', '1355904344247111690',
  '1370708666486882445', '1358821133323075846', '1355904246977134817', '1355903157363802222'
];

module.exports = {
  name: 'promote',
  description: 'Promotes up to 10 users to the next role in the scout hierarchy',
  async execute(message, args) {
    if (!ALLOWED_USERS.includes(message.author.id))
      return message.reply('❌ You are not authorized to use this command.');

    const mentionedMembers = message.mentions.members;
    if (mentionedMembers.size === 0 || mentionedMembers.size > 10)
      return message.reply('❌ Mention 1 to 10 users to promote.');

    const reasonIndex = [...mentionedMembers.values()].length + 1;
    const reason = args.slice(reasonIndex).join(' ') || 'No reason provided.';
    const announceChannel = message.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID);
    if (!announceChannel) return message.reply('❌ Announcement channel not found.');

    const embed = new EmbedBuilder()
      .setTitle(':SurveyCorpsScoutingLegion: Promotions :SurveyCorpsScoutingLegion:')
      .setColor('Green')
      .setDescription(`<@&📈> Congratulations to the following for their promotions!\n\n**Reason:** ${reason}`)
      .setTimestamp();

    for (const [_, user] of mentionedMembers) {
      try {
        const currentIndex = roles.findIndex(id => user.roles.cache.has(id));

        if (currentIndex === -1) {
          const baseRole = message.guild.roles.cache.get(roles[0]);
          if (!baseRole) {
            message.channel.send(`❌ Role not found for ${user.user.tag}.`);
            continue;
          }

          await user.roles.add(baseRole);
          await setNickname(user, baseRole.name);

          embed.addFields({
            name: `${user.user.tag}`,
            value: `⬆️ Promoted to **${baseRole.name}**`
          });

        } else if (currentIndex === roles.length - 1) {
          message.channel.send(`⚠️ ${user} is already at the highest role.`);
        } else {
          const currentRole = message.guild.roles.cache.get(roles[currentIndex]);
          const nextRole = message.guild.roles.cache.get(roles[currentIndex + 1]);

          if (!nextRole) {
            message.channel.send(`❌ Next role not found for ${user.user.tag}.`);
            continue;
          }

          await user.roles.remove(currentRole);
          await user.roles.add(nextRole);
          await setNickname(user, nextRole.name);

          embed.addFields({
            name: `${user.user.tag}`,
            value: `⬆️ Promoted from **${currentRole.name}** to **${nextRole.name}**`
          });
        }

      } catch (err) {
        console.error(`Error promoting ${user.user.tag}:`, err);
        message.channel.send(`❌ Failed to promote ${user.user.tag}.`);
      }
    }

    await announceChannel.send({ embeds: [embed] });
    message.reply('✅ Promotion announcement sent!');
  }
};

async function setNickname(member, roleName) {
  try {
    const baseName = member.user.username;
    const cleanRole = roleName.replace(/[^a-zA-Z ]/g, '').trim();
    await member.setNickname(`« ${cleanRole} | ${baseName} | »`);
  } catch (error) {
    console.error(`Failed to set nickname for ${member.user.tag}:`, error);
  }
}
