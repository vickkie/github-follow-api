const axios = require("axios");
require("dotenv").config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = "vickkie";
const EXCEPTIONS = ["crnacura", "Cuberto", "vuejs", "dougkalash", "george0st", "codrops"]; // Replace with actual GitHub usernames

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

  return following;
};

const unfollowUser = async (user) => {
  try {
    await axios.delete(`https://api.github.com/user/following/${user}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    console.log(`Unfollowed ${user}.`);
  } catch (error) {
    console.error(`Error unfollowing ${user}:`, error);
  }
};

const checkFollowers = async () => {
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
        console.log(`${user} does not follow you back. Unfollowing...`);
        await unfollowUser(user);
      }
    } catch (error) {
      console.error(`Error checking followers for ${user}:`, error);
    }
  }
};

checkFollowers();
