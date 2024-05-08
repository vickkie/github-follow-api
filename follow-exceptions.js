//It auto follower those who follow you

require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const githubToken = process.env.GITHUB_TOKEN;
const githubUsername = process.env.GITHUB_USERNAME;

const headers = {
  Authorization: `Basic ${Buffer.from(`${githubUsername}:${githubToken}`).toString("base64")}`,
};

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data.split("\n").filter(Boolean)); // Filter out empty lines
    });
  });
};

const getFollowing = async () => {
  let following = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const response = await axios.get(`https://api.github.com/users/${githubUsername}/following?page=${page}`, {
        headers: {
          Authorization: `token ${githubToken}`,
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

const getExceptions = async () => {
  let exceptions = [];

  try {
    let exceptionsList = await readFile("exception.txt");
    exceptions = exceptions.concat(exceptionsList);
    let listb = [];
    for (const exceptionL of exceptionsList) {
      listb.push(exceptionL);
    }

    console.log(`exception list`, exceptions);
    console.log(`exception 2`, exceptionsList);
    console.log(`list b`, listb);
  } catch (error) {
    console.error("Error processing files:", error);
  }

  return exceptions;
};

const followUsers = async (following, exceptions) => {
  for (const exception of exceptions) {
    if (!following.includes(exception)) {
      try {
        await axios.put(`https://api.github.com/user/following/${exception}`, {}, { headers });
        console.log(`Start Following: ${exception}`);
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
    const exceptions = await getExceptions();
    const following = await getFollowing();
    await followUsers(exceptions, following);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
