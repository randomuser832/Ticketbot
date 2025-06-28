const fs = require('fs');

const ALLOWED_USERS = ['533339674173767682', '810198568845049886']; 

const roles = [
  '1383042623354179664','1382766397263974491','1383042873615978546',
  '1355904538128814263','1355904464661516438','1355904344247111690',
  '1370708666486882445','1358821133323075846','1355904246977134817','1355903157363802222'
];

module.exports = {
  name: 'demote',
  description: 'Demotes a user to the next role in the scout hierarchy',
  async execute(message, args) {
    if (!ALLOWED_USERS.includes(message.author.id))
      return message.reply('❌ You are not authorized to use this command.');

    const user = message.mentions.members.first();
    if (!user) return message.reply('❌ Mention a user to demote.');

    const currentIndex = roles.findIndex(id => user.roles.cache.has(id));
    if (currentIndex === -1) {
      const role = message.guild.roles.cache.get(roles[0]);
      if (!role) return message.reply('❌ Role not found.');
      await user.roles.add(role);
      await setNickname(user, role.name);
      return message.reply(`✅ Demoted ${user} to **${role.name}**.`);
    }

    if (currentIndex === 0)
      return message.reply('⚠️ User is already at the lowest role.');

    const nextRole = message.guild.roles.cache.get(roles[currentIndex - 1]);
    if (!nextRole) return message.reply('❌ Next role not found.');

    await user.roles.remove(roles[currentIndex]);
    await user.roles.add(nextRole);
    await setNickname(user, nextRole.name);

    message.reply(`✅ Demoted ${user} to **${nextRole.name}**.`);
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
