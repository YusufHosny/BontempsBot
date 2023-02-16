const { Events } = require('discord.js');
const { getLastSeenString } = require('../modules/lastSeen.js');

class LSUser
{
    constructor(userId, time) {
        this.id = userId;
        this.lastSeen = time;
        this.online = false;
    }
}





module.exports = {
	name: Events.ClientReady,
	once: true,
    userList: [],
	async execute(client) {
		// Get guild and member list
        const guild = await client.guilds.fetch('835672578819358751');
        const members = await guild.members.fetch({withPresences: true, force: true});

        // Initialize list of users with last seen unknown
        members.forEach(member => {
            this.userList.push(new LSUser(member.id, 'unknown'));
        });

        setInterval(() => {
            this.userList.forEach(
                user => {
                    if(user.online) {
                        user.lastSeen = getLastSeenString();
                        console.log(`refreshed for user #${this.userList.indexOf(user)}`);
                    }
                });

        }, 10 * 1000);
	},
};