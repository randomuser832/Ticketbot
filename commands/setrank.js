const fs = require('fs');
const ALLOWED_USERS = ['533339674173767682', '810198568845049886', '527630883084173321']; // Replace with actual authorized user IDs

module.exports = {
  name: 'setrank',
  description: 'Sets a user to a mentioned role in the hierarchy',
  async execute(message, args) {
    if (!ALLOWED_USERS.includes(message.author.id))
      return message.reply('❌ You are not authorized to use this command.');

    const mentions = message.mentions.members;
    const rolesMentioned = message.mentions.roles;

    // Need at least one user and one role mentioned
    if (mentions.size < 1 || rolesMentioned.size < 1)
      return message.reply('❌ Mention a user and a rank role.');

    const targetUser = mentions.first();
    const targetRole = rolesMentioned.first();

    const hierarchyRoles = [
      '1383042623354179664','1382766397263974491','1383042873615978546',
      '1355904538128814263','1355904464661516438','1355904344247111690',
      '1370708666486882445','1358821133323075846','1355904246977134817','1355903157363802222'
    ];

    // Ensure the role is part of the hierarchy
    if (!hierarchyRoles.includes(targetRole.id))
      return message.reply('❌ That role is not part of the rank hierarchy.');

    // Remove all hierarchy roles from the target user
    for (const id of hierarchyRoles) {
      if (targetUser.roles.cache.has(id)) {
        await targetUser.roles.remove(id);
      }
    }

    // Add the new role
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
