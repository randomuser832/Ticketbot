const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const RSVP_STORAGE = new Map(); // You can replace this with a JSON/db if you want to persist

module.exports = {
  name: 'event',
  description: 'Create an event with RSVP buttons',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageEvents') && !message.member.permissions.has('Administrator')) {
      return message.reply('❌ You do not have permission to create events.');
    }

    const content = args.join(' ').split('|').map(x => x.trim());

    if (content.length < 4) {
      return message.reply('❌ Usage: `!event [name] | [description] | [date] | [time]`\nExample: `!event Game Night | Fun games and laughs | July 1, 2025 | 6:00 PM EST`');
    }

    const [name, description, date, time] = content;
    const eventId = `${message.channel.id}-${Date.now()}`;
    RSVP_STORAGE.set(eventId, { attending: [], maybe: [], declined: [] });

    const embed = new EmbedBuilder()
      .setTitle(`📅 ${name}`)
      .setDescription(description)
      .addFields(
        { name: '📆 Date', value: date, inline: true },
        { name: '⏰ Time', value: time, inline: true },
        { name: '✅ Attending', value: 'No one yet', inline: false }
      )
      .setColor('Blue')
      .setFooter({ text: 'RSVP by clicking a button below!' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`attending_${eventId}`)
        .setLabel('✅ Attend')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`maybe_${eventId}`)
        .setLabel('🤔 Maybe')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`decline_${eventId}`)
        .setLabel('❌ Decline')
        .setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
