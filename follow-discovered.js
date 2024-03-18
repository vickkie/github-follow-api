require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const githubToken = process.env.GITHUB_TOKEN;
const githubUsername = process.env.GITHUB_USERNAME;

const headers = {
  Authorization: `Basic ${Buffer.from(`${githubUsername}:${githubToken}`).toString("base64")}`,
};

const followNewUsers = async (newUsers) => {
  const remainingUsers = [];

  for (const user of newUsers) {
    try {
      await axios.put(`https://api.github.com/user/following/${user}`, {}, { headers });
      console.log(`Start Following: ${user}`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Sleep for 2 seconds
    } catch (error) {
      console.log("Rate-limited, please wait until it finish!");
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Sleep for 60 seconds
      remainingUsers.push(user);
    }
  }

  // Update the file with the remaining users to follow
  fs.writeFileSync("new_users_list.txt", remainingUsers.join("\n"), "utf8");
};

(async () => {
  try {
    const newUsers = fs.readFileSync("new_users_list.txt", "utf8").split("\n").filter(Boolean);
    await followNewUsers(newUsers);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
