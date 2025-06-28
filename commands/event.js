const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const RSVP_STORAGE = new Map(); // In-memory event storage

module.exports = {
  name: 'event',
  description: 'Creates an event and allows users to RSVP',
  async execute(message, args, client) {
    if (args.length < 4) {
      return message.reply('❌ Usage: `!event "Name" "Description" "Date" "Time"`');
    }

    const [name, description, date, time] = args;

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
      .setFooter({ text: 'Click a button below to RSVP' })
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

    // Attach listener to interaction handler (from index.js)
    if (!client.rsvpStorage) client.rsvpStorage = RSVP_STORAGE;
  }
};
