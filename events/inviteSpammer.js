const { Events } = require('discord.js');


module.exports = {
    name: Events.GuildMemberRemove, 
    async execute(member){
        //const guild = await client.guilds.fetch('835672578819358751');
        const guild = member.guild; 
        const invite =  await guild.invites.create('835672579498049538');
        const DM = await member.createDM();
        DM.send("Join back idiot " + invite.url); 

        //member.dmChannel.send("Join back idiot " + invite.url); 
        

        







    }

    









}