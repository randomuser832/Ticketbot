const fs = require('fs');
const ALLOWED_USERS = ['533339674173767682', '810198568845049886', '527630883084173321']; // Allowed users

module.exports = {
  name: 'demote',
  description: 'Demotes a user to the next role in the scout hierarchy',
  async execute(message, args) {
    console.log('Author ID:', message.author.id);
    console.log('Allowed Users:', ALLOWED_USERS);
    console.log('Is Allowed:', ALLOWED_USERS.map(id => id.trim()).includes(message.author.id.trim()));

    if (!ALLOWED_USERS.map(id => id.trim()).includes(message.author.id.trim()))
      return message.reply('❌ You are not authorized to use this command.');

    const user = message.mentions.members.first();
    if (!user) return message.reply('❌ Mention a user to demote.');

    const roles = [
      '1383042623354179664','1382766397263974491','1383042873615978546',
      '1355904538128814263','1355904464661516438','1355904344247111690',
      '1370708666486882445','1358821133323075846','1355904246977134817','1355903157363802222'
    ];

    const currentIndex = roles.findIndex(id => user.roles.cache.has(id));
    if (currentIndex === -1) {
      const role = message.guild.roles.cache.get(roles[0]);
      if (!role) return message.reply('❌ Role not found.');
      await user.roles.add(role);
      message.reply(`✅ Demoted ${user} to **${role.name}**.`);
      return logAction('demote', message.author.tag, user.user.tag, null, role.id);
    }

    if (currentIndex === 0) 
      return message.reply('⚠️ User is already at the highest role.');

    const nextRole = message.guild.roles.cache.get(roles[currentIndex - 1]);
    if (!nextRole) return message.reply('❌ Next role not found.');
    await user.roles.remove(roles[currentIndex]);
    await user.roles.add(nextRole);
    message.reply(`✅ Demoted ${user} to **${nextRole.name}**.`);
    logAction('demote', message.author.tag, user.user.tag, roles[currentIndex], nextRole.id);
  }
};

function logAction(action, executor, target, fromRole, toRole) {
  let logs = [];
  const path = './data/promotions.json';
  if (fs.existsSync(path)) logs = JSON.parse(fs.readFileSync(path));
  logs.push({ action, executor, target, fromRole, toRole, timestamp: new Date().toISOString() });
  fs.writeFileSync(path, JSON.stringify(logs, null, 2));
}
