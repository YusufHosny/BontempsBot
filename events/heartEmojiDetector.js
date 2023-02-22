const { Events } = require('discord.js');


module.exports = {
    name: Events.MessageReactionAdd,
    async execute(messageReaction) {
        const channel = messageReaction.message.channel; 
        await messageReaction.fetch();  
        
        if(messageReaction.emoji.toString() === '❤️'){
            channel.send('WTF BRACE'); 
        }
        else if(messageReaction.emoji.toString() === '😭'){
            channel.send('😭😭😭'); 
        }
    }
}