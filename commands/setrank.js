const fs = require('fs');
const ALLOWED_USERS = ['533339674173767682', '810198568845049886'];

module.exports = {
  name: 'setrank',
  description: 'Sets a user to a mentioned role without hierarchy restrictions',
  async execute(message, args) {
    
    console.log('Author ID:', message.author.id);
    console.log('Allowed Users:', ALLOWED_USERS);
    console.log('Is Allowed:', ALLOWED_USERS.map(id => id.trim()).includes(message.author.id.trim()));

    if (!ALLOWED_USERS.map(id => id.trim()).includes(message.author.id.trim()))
      return message.reply('❌ You are not authorized to use this command.');

    const mentions = message.mentions.members;
    const rolesMentioned = message.mentions.roles;

    if (mentions.size < 1 || rolesMentioned.size < 1)
      return message.reply('❌ Please mention a user and a role.');

    const targetUser = mentions.first();
    const targetRole = rolesMentioned.first();

    if (targetUser.roles.cache.has(targetRole.id)) {
      await targetUser.roles.remove(targetRole);
    }

    await targetUser.roles.add(targetRole);

    message.reply(`✅ Set ${targetUser} to **${targetRole.name}**.`);

    logAction('setrank', message.author.tag, targetUser.user.tag, null, targetRole.id);
  }
};

function logAction(action, executor, target, fromRole, toRole) {
  const path = './data/promotions.json';
  let logs = [];
  if (fs.existsSync(path)) logs = JSON.parse(fs.readFileSync(path));
  logs.push({ action, executor, target, fromRole, toRole, timestamp: new Date().toISOString() });
  fs.writeFileSync(path, JSON.stringify(logs, null, 2));
}
