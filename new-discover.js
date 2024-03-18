require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const githubToken = process.env.GITHUB_TOKEN;
const githubUsername = process.env.GITHUB_USERNAME;

const headers = {
  Authorization: `Basic ${Buffer.from(`${githubUsername}:${githubToken}`).toString("base64")}`,
};

const following = async () => {
  const res = await axios.get(`https://api.github.com/users/${githubUsername}/following`, { headers });
  const following = res.data.map((user) => user.login);
  return following;
};

const getRandomUsers = async (followingList) => {
  let newUsers = [];
  try {
    newUsers = fs.readFileSync("new_users_list.txt", "utf8").split("\n").filter(Boolean);
  } catch (error) {
    // File does not exist or is empty, start from scratch
  }

  const lastPage = fs.existsSync("last_page.txt") ? parseInt(fs.readFileSync("last_page.txt", "utf8")) : 1;
  const pages = 30;

  for (let i = lastPage; i < lastPage + pages; i++) {
    const res = await axios.get(`https://api.github.com/users?since=${i}`, { headers });
    for (const user of res.data) {
      if (!followingList.includes(user.login) && !newUsers.includes(user.login)) {
        newUsers.push(user.login);
        console.log(`Finding ${user.login}`);
        fs.appendFileSync("new_users_list.txt", `${user.login}\n`);
      }
    }
  }

  fs.writeFileSync("last_page.txt", (lastPage + pages).toString());
  console.log(`Finding ${newUsers.length} user`);
  return newUsers;
};

const followingNew = async (newUsersList) => {
  console.log("Starting to Follow Users...");
  for (const user of newUsersList) {
    try {
      await axios.put(`https://api.github.com/user/following/${user}`, {}, { headers });
      console.log(`Start Following: ${user}`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Sleep for 2 seconds
    } catch (error) {
      console.log("Rate-limited, please wait until it finish!");
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Sleep for 60 seconds
    }
  }
};

(async () => {
  try {
    const followingList = await following();
    const newUsersList = await getRandomUsers(followingList);
    await followingNew(newUsersList);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
