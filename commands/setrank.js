const fs = require('fs');
const ALLOWED_USERS = ['533339674173767682', '810198568845049886','527630883084173321']; // Replace with actual Discord user IDs allowed

module.exports = {
  name: 'setrank',
  description: 'Sets a user to a specific rank in the hierarchy',
  async execute(message, args) {
    if (!ALLOWED_USERS.includes(message.author.id))
      return message.reply('❌ You are not authorized to use this command.');

    const user = message.mentions.members.first();
    if (!user) return message.reply('❌ Mention a user.');
    const roleName = args.slice(1).join(' ');
    if (!roleName) return message.reply('❌ Provide a role name.');

    const roles = [
      '1383042623354179664','1382766397263974491','1383042873615978546',
      '1355904538128814263','1355904464661516438','1355904344247111690',
      '1370708666486882445','1358821133323075846','1355904246977134817','1355903157363802222'
    ];

    const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (!role || !roles.includes(role.id)) return message.reply('❌ Role not found or not part of hierarchy.');

    for (const id of roles) {
      if (user.roles.cache.has(id)) await user.roles.remove(id);
    }
    await user.roles.add(role);
    message.reply(`✅ Set ${user} to **${role.name}**.`);
    logAction('setrank', message.author.tag, user.user.tag, null, role.id);
  }
};

function logAction(action, executor, target, fromRole, toRole) {
  let logs = [];
  const path = './data/promotions.json';
  if (fs.existsSync(path)) logs = JSON.parse(fs.readFileSync(path));
  logs.push({ action, executor, target, fromRole, toRole, timestamp: new Date().toISOString() });
  fs.writeFileSync(path, JSON.stringify(logs, null, 2));
}
