const Discord = require("discord.js");
const fs = require("fs");

let leetMessageCount = 0;
const client = new Discord.Client({ intents: [3276799] });
const counts = new Map();
const leetRegex = /(^|[^a-z])leet($|[^a-z])/i;

function loadCounts() {
	fs.readFile("counts.json", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		const savedCounts = JSON.parse(data);
		Object.keys(savedCounts).forEach((userId) => {
			counts.set(userId, savedCounts[userId]);
		});
	});
}

function saveCounts() {
	const countsObj = {};

	counts.forEach((value, key) => {
		countsObj[key] = value;
	});

	fs.writeFile("counts.json", JSON.stringify(countsObj), (err) => {
		if (err) {
			console.error(err);
		}
	});
}

client.on("ready", () => {
	console.log("Bot is ready!");

	loadCounts();
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;

	const now = new Date();
	const isLeetText = leetRegex.test(message.content);

	if (
		now.getHours() === 12 &&
		now.getMinutes() === 37 &&
		isLeetText
	) {
		const user = message.author;
		const today = new Date().toDateString();

		if (counts.has(user.id) && counts.get(user.id).date === today) {
			try {
				await message.react('❌');
			} catch (e) {
				// gjør noe, evt bare gå videre
			}
			return;
		}

		if (!counts.has(user.id)) {
			counts.set(user.id, {count: 0, date: today});
		} else {
			counts.get(user.id).date = today;
		}
		counts.get(user.id).count++;
		try {
			await message.react('✅');
		} catch (e) {
			// gjør noe, evt bare gå videre
		}

		saveCounts();
		leetMessageCount++;

		if (leetMessageCount === 1) {
			setTimeout(() => {
				const entries = Array.from(counts.entries()).map(
					([userId, {count}]) => ({userId, count})
				);
				entries.sort((a, b) => b.count - a.count);

				// Create a string containing the leaderboard message
				let leaderboardMessage = "**Leaderboard:**\n";
				for (let i = 0; i < entries.length && i < 15; i++) {
					const user = client.users.cache.get(entries[i].userId);
					leaderboardMessage += `${i + 1}. ${user.username} - ${
						entries[i].count
					} leet(s)\n`;
				}

				message.channel.send(leaderboardMessage);
				leetMessageCount = 0;
			}, 60 * 1000);
		}
	} else if (isLeetText) {
		try {
		await message.react("870236655624290304");
		} catch (e) {
			// gjør noe, evt bare gå videre
		}
	}
});

client.login("MTA0OTI1NzEwNzYyMDM3NjY1Ng.GP55Lm.epIq-KMidN8lu6wHEhdD1rUMbifm4_ryr0h9eU");
