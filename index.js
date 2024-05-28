const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed, Modal, TextInputComponent, InteractionType } = require('discord.js');
const fs = require('fs');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.MESSAGE_CONTENT,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

const token = 'Token'; // حط التوكن بتاعك
const prefix = '~'; // البريفكس

let tasks = [];

const loadTasks = () => {
    try {
        const dataBuffer = fs.readFileSync('data.json');
        const dataJSON = dataBuffer.toString();
        tasks = JSON.parse(dataJSON);
    } catch (e) {
        tasks = [];
    }
};


const saveTasks = () => {
    const dataJSON = JSON.stringify(tasks);
    fs.writeFileSync('data.json', dataJSON);
};

client.once('ready', () => {
    console.log(`Say My Name : ${client.user.tag}`)
    loadTasks(); 
});

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'setup') {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Bot Commands')
            .addFields(
		{ name: 'Add Task', value:  'اضافه مهمه جديده' },
		{ name: 'Listtask', value:  'عرض جميع مهامك', inline: true },
		{ name: 'RemindMe', value: 'تذكيرك علي وجود مهمه او شئ اخر', inline: true },
        { name: 'DeleteTask', value: 'لحذف المهمه التي اكملتها', inline: true },
	)
            .setFooter({ text: `DevXor Team`});
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('addtask')
                    .setLabel('Add Task')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('listtasks')
                    .setLabel('List Tasks')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('remindme')
                    .setLabel('Set Reminder')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('deletetask')
                    .setLabel('Delete Task')
                    .setStyle('DANGER')
            );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    if (customId === 'addtask') {
        const modal = new Modal()
            .setCustomId('addTaskModal')
            .setTitle('Add New Task')
            .addComponents(
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('taskInput')
                        .setLabel('Task')
                        .setStyle('PARAGRAPH')
                        .setPlaceholder('Enter Your Task Here')
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);
    } else if (customId === 'listtasks') {
    if (tasks.length === 0) {
        await interaction.reply('No Tasks Available.');
    }
 else {
            const taskList = tasks.map((t, index) => `${index + 1}. ${t.task}`).join('\n');

           const embed = new MessageEmbed()
			.setTitle('Your All Tasks')
            .setDescription(`${taskList}`)
            await interaction.reply({ embeds: [embed] }) 
		}
			
        } else if (customId === 'remindme') {
        const modal = new Modal()
            .setCustomId('remindMeModal')
            .setTitle('Set Reminder')
            .addComponents(
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('timeInput')
                        .setLabel('Time in minutes')
                        .setStyle('SHORT')
                        .setPlaceholder('Enter the time in minutes')
                        .setRequired(true)
                ),
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('reminderInput')
                        .setLabel('Reminder')
                        .setStyle('PARAGRAPH')
                        .setPlaceholder('Enter Your Reminder Here')
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);
    } 
	else if (customId === 'deletetask') {
        if (tasks.length === 0) {
            await interaction.reply('No Tasks Available To Delete.');
        } else {
            const rows = [];
            tasks.forEach((task, index) => {
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(`delete_${index}`)
                        .setLabel(`Delete Task ${index + 1}`)
                        .setStyle('DANGER')
                );
                rows.push(row);
            });

            await interaction.reply({ content: 'Select a Task To Delete:', components: rows });
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    const { customId } = interaction;

    if (customId === 'addTaskModal') {
        const task = interaction.fields.getTextInputValue('taskInput');
        tasks.push({ task, added: new Date() });
        saveTasks();
        await interaction.reply(`Task added: ${task}`);
    } else if (customId === 'remindMeModal') {
        const time = parseInt(interaction.fields.getTextInputValue('timeInput'));
        const reminder = interaction.fields.getTextInputValue('reminderInput');

        if (isNaN(time)) {
            return await interaction.reply('Please specify a valid time in minutes.');
        }

        await interaction.reply(`Reminder set for ${time} minutes: ${reminder}`);
        setTimeout(() => {
            interaction.followUp(`Hello : <@${interaction.user.id}> Your Reminder Now : ${reminder}`);
        }, time * 60000);
    }
});
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    if (customId.startsWith('delete_')) {
        const index = parseInt(customId.split('_')[1]);
        if (isNaN(index) || index < 0 || index >= tasks.length) {
            return await interaction.reply('Invalid Task Index.');
        }

        const removedTask = tasks.splice(index, 1);
        saveTasks();
        await interaction.reply(`Deleted task: ${removedTask[0].task}`);
    }
});
client.login(token);
