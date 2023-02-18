const { Events } = require('discord.js');


module.exports = {
    name: Events.MessageReactionAdd ,
    async  execute(messageReaction , user){
        const channel = messageReaction.message.channel; 
        const reaction = await messageReaction.fetch() ; 

        console.log(messageReaction.emoji.toString()) ;
        if(messageReaction.emoji.toString() === '❤️'){
            channel.send('WTF BRACE'); 

        }

        

    }
        


    }






