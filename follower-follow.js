require("dotenv").config();
const axios = require("axios");

const githubToken = process.env.GITHUB_TOKEN;
const githubUsername = process.env.GITHUB_USERNAME;

const headers = {
  Authorization: `Basic ${Buffer.from(`${githubUsername}:${githubToken}`).toString("base64")}`,
};

const fetchFollowers = async () => {
  let followers = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await axios.get(`https://api.github.com/users/${githubUsername}/followers?page=${page}`, {
      headers,
    });
    followers = [...followers, ...response.data.map((user) => user.login)];
    hasNextPage = response.headers.link && response.headers.link.includes('rel="next"');
    page++;
  }

  return followers;
};

const fetchFollowing = async () => {
  let following = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await axios.get(`https://api.github.com/users/${githubUsername}/following?page=${page}`, {
      headers,
    });
    following = [...following, ...response.data.map((user) => user.login)];
    hasNextPage = response.headers.link && response.headers.link.includes('rel="next"');
    page++;
  }

  return following;
};

const followUsers = async (followers, following) => {
  for (const follower of followers) {
    if (!following.includes(follower)) {
      try {
        await axios.put(`https://api.github.com/user/following/${follower}`, {}, { headers });
        console.log(`Start Following: ${follower}`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Sleep for 2 seconds
      } catch (error) {
        console.log("Rate-limited, please wait until it finish!");
        await new Promise((resolve) => setTimeout(resolve, 60000)); // Sleep for 60 seconds
      }
    }
  }
};

(async () => {
  try {
    const followers = await fetchFollowers();
    const following = await fetchFollowing();
    await followUsers(followers, following);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
