const { Events } = require('discord.js');
const { getLastSeenString } = require('../modules/lastSeen.js');

// Last seen user class
class LSUser
{
    constructor(userId, lastSeen) {
        this.id = userId;
        this.lastSeen = lastSeen;

        // Defaults to offline
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

        // Every 2 minutes
        setInterval(() => {
            // For each user in the user list
            this.userList.forEach(
                // Check if that user is online and refresh their lastSeen value to the current time
                user => {
                    if(user.online) {
                        user.lastSeen = getLastSeenString();

                        // For testing purposes if needed
                        // console.log(`refreshed for user #${this.userList.indexOf(user)}`);
                    }
                });

        }, 120 * 1000); // Wait 2 minutes
	},
};