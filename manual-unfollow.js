//First run followers-check.js to get the list of followers and non followers
//requires you to have the following files in the same directory as the script
// following.txt,
//  followers.txt,
//   exceptions.txt;

const axios = require("axios");
require("dotenv").config();
const fs = require("fs");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data.split("\n").filter(Boolean)); // Filter out empty lines
    });
  });
};

const unfollowUser = async (user) => {
  try {
    const response = await axios.delete(`https://api.github.com/user/following/${user}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    console.log(`Unfollowed ${user}.`);
    return response.headers["x-ratelimit-remaining"];
  } catch (error) {
    console.error(`Error unfollowing ${user}:`, error);
    return null;
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const unfollowNonFollowers = async () => {
  try {
    const following = await readFile("following.txt");
    const followers = await readFile("followers.txt");
    const exceptions = await readFile("exception.txt"); // Read exceptions from file

    const nonFollowers = following.filter((user) => !followers.includes(user) && !exceptions.includes(user));

    console.log(`You are following ${following.length} users.`);
    console.log(`You have ${followers.length} followers.`);
    console.log(`You will unfollow ${nonFollowers.length} users.`);

    for (const user of nonFollowers) {
      const remaining = await unfollowUser(user);
      if (remaining !== null && remaining <= 10) {
        // If less than 10 requests remaining
        const resetTime = new Date(Date.now() + 60000); // Wait until the rate limit resets
        console.log(`Rate limit reached. Waiting until ${resetTime} to continue.`);
        await delay(60000); // Wait for 1 minute
      }
    }
  } catch (error) {
    console.error("Error processing files:", error);
  }
};

unfollowNonFollowers();
