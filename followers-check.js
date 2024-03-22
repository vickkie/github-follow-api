//Run this to get both who follow you and who dont.. it outputs both in files
// after this you can run manual unfollow to unfollow people who dont follow you

const axios = require("axios");
require("dotenv").config();
const fs = require("fs");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;

const nonFollowers = [];

const getFollowing = async () => {
  let following = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const response = await axios.get(`https://api.github.com/users/${USERNAME}/following?page=${page}`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      });
      following = following.concat(response.data.map((user) => user.login));
      hasNextPage = response.data.length > 0;
      page++;
    } catch (error) {
      console.error("Error fetching following list:", error);
      break;
    }
  }

  fs.writeFile("following.txt", following.join("\n"), (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  return following;
};

const getFollowers = async () => {
  let followers = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const response = await axios.get(`https://api.github.com/users/${USERNAME}/followers?page=${page}`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      });
      followers = followers.concat(response.data.map((user) => user.login));
      hasNextPage = response.data.length > 0;
      page++;
    } catch (error) {
      console.error("Error fetching followers list:", error);
      break;
    }
  }

  console.log(followers);

  fs.writeFile("followers.txt", followers.join("\n"), (err) => {
    if (err) throw err;
    console.log("The followers list has been saved!");
  });

  return followers;
};

getFollowers();

const checkFollowers = async () => {
  const following = await getFollowing();
  console.log(`You are following ${following.length} users.`);

  for (const user of following) {
    try {
      const response = await axios.get(`https://api.github.com/users/${user}/followers`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      });
      const followers = response.data.map((follower) => follower.login);
      if (!followers.includes(USERNAME)) {
        console.log(`${user} does not follow you back.`);
        nonFollowers.push(user);
      }
    } catch (error) {
      console.error(`Error checking followers for ${user}:`, error);
    }
  }

  fs.writeFile("nonFollowers.txt", nonFollowers.join("\n"), (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
};

checkFollowers();
