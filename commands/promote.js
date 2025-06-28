const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

const ALLOWED_USERS = ['533339674173767682', '810198568845049886']; 
const ANNOUNCE_CHANNEL_ID = '1355906365679206420'; 

const roles = [
  '1383042623354179664','1382766397263974491','1383042873615978546',
  '1355904538128814263','1355904464661516438','1355904344247111690',
  '1370708666486882445','1358821133323075846','1355904246977134817','1355903157363802222'
];

module.exports = {
  name: 'promote',
  description: 'Promotes up to 2 users to the next role in the scout hierarchy',
  async execute(message, args) {
    if (!ALLOWED_USERS.includes(message.author.id))
      return message.reply('❌ You are not authorized to use this command.');

    const mentionedMembers = message.mentions.members;
    if (mentionedMembers.size === 0 || mentionedMembers.size > 2)
      return message.reply('❌ Please mention 1 or 2 users to promote.');

    const reason = args.slice(mentionedMembers.size + 1).join(' ') || 'No reason provided.';
    const announceChannel = message.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID);
    if (!announceChannel) return message.reply('❌ Announcement channel not found.');

    const embed = new EmbedBuilder()
      .setTitle(':tada: Congratulations on Your Promotion! :tada:')
      .setColor('GREEN')
      .setTimestamp();

    embed.addFields({ name: 'Promotion Details', value: `Reason: ${reason}` });

    for (const [_, user] of mentionedMembers) {
      const currentIndex = roles.findIndex(id => user.roles.cache.has(id));

      if (currentIndex === -1) {
        const role = message.guild.roles.cache.get(roles[0]);
        if (!role) {
          message.channel.send(`❌ Role not found for ${user.user.tag}.`);
          continue;
        }
        await user.roles.add(role);
        await setNickname(user, role.name);

        embed.addFields({
          name: `${role.name} - ${user.user.tag}`,
          value: `Welcome to your new rank! 🎉`
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
          name: `${currentRole.name} → ${nextRole.name} - ${user.user.tag}`,
          value: `Keep up the great work! 🎉`
        });
      }
    }

    await announceChannel.send({ embeds: [embed] });
    message.reply('✅ Promotion announcement sent!');
  }
};

async function setNickname(member, roleName) {
  try {
    const baseName = member.user.username;
    const cleanRoleName = roleName.replace(/[^a-zA-Z ]/g, '').trim();
    await member.setNickname(`« ${cleanRoleName} | ${baseName} | »`);
  } catch (error) {
    console.error(`Failed to set nickname for ${member.user.tag}:`, error);
  }
}
