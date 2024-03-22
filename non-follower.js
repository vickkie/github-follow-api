const axios = require("axios");
require("dotenv").config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;
const EXCEPTIONS = ["crnacura", "Cuberto", "vuejs", "dougkalash", "codrops"]; // Replace with actual GitHub usernames

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

      // Log the remaining rate limit
      const remainingRateLimit = response.headers["x-ratelimit-remaining"];
      console.log(`Remaining rate limit: ${remainingRateLimit}`);
    } catch (error) {
      console.error("Error fetching following list:", error);
      break;
    }
  }

  return following;
};

const listNonFollowers = async () => {
  const following = await getFollowing();
  console.log(`You are following ${following.length} users.`);

  for (const user of following) {
    if (EXCEPTIONS.includes(user)) {
      console.log(`Skipping ${user} due to exception list.`);
      continue;
    }
    try {
      const response = await axios.get(`https://api.github.com/users/${user}/followers`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      });
      const followers = response.data.map((follower) => follower.login);
      if (!followers.includes(USERNAME)) {
        console.log(`${user} does not follow you back.`);
      }
    } catch (error) {
      console.error(`Error checking followers for ${user}:`, error);
    }
  }
};

listNonFollowers();
