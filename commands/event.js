client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const [type, eventId] = interaction.customId.split('_');
  const event = RSVP_STORAGE.get(eventId);
  if (!event) return interaction.reply({ content: '⚠️ Event not found or expired.', ephemeral: true });

  const userId = interaction.user.id;
  const userTag = interaction.user.tag;

  // Remove from all RSVP categories first
  for (const key of ['attending', 'maybe', 'declined']) {
    const index = event[key].indexOf(userTag);
    if (index !== -1) event[key].splice(index, 1);
  }

  // Add to the selected category
  event[type].push(userTag);

  // Update embed
  const embed = EmbedBuilder.from(interaction.message.embeds[0]);
  embed.spliceFields(2, 1, {
    name: '✅ Attending',
    value: event.attending.length ? event.attending.join('\n') : 'No one yet',
    inline: false
  });

  await interaction.update({ embeds: [embed] });
});
