// IMPORT
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const fs = require("fs");
const { Hexor } = require("hexor");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// INPUT ARG
const args = process.argv.slice(2);
if (args.length < 2) {
  //   console.log("Usage: node script.js --token <token> --username <username>");
  process.exit(1);
}
const tokenIndex = args.indexOf("--token");
const usernameIndex = args.indexOf("--username");
const token = args[tokenIndex + 1];
const username = args[usernameIndex + 1];

const p1 = new Hexor(false, "hex");

// RESPONE AUTH
const auth = Buffer.from(`${username}:${token}`).toString("base64");
const HEADERS = { Authorization: `Basic ${auth}` };
(async () => {
  const res = await fetch("https://api.github.com/user", { headers: HEADERS });
  if (res.status !== 200) {
    p1.c("Failure to Authenticate! Please check PersonalAccessToken and Username!", "#ff0000");
    process.exit(1);
  } else {
    p1.c("Authentication Succeeded!", "#22a701");
    following(args);
  }
})();

// SESSION HEADER
const sesh = fetch;

// OUTPUT list of i'm following:
async function following(args) {
  const target = args[usernameIndex + 1];
  const res = await sesh(`https://api.github.com/users/${target}/following`, { headers: HEADERS });
  const linkArray = res.headers
    .get("Link")
    .split(",")
    .map((link) =>
      link.split(";").reduce((acc, part) => {
        const match = part.match(/<([^>]*)>/);
        if (match) {
          return { ...acc, [part.trim().split(";")[1]]: match[1] };
        }
        return acc;
      }, {})
    );
  const lastPage = new URL(linkArray['rel="last"']).searchParams.get("page");
  const following = [];
  console.log(`Grabbing ${target} Following\nThis may take a while... there are ${lastPage} pages to go through.`);
  for (let i = 1; i <= lastPage; i++) {
    const res = await sesh(`https://api.github.com/users/${target}/following?page=${i}`, { headers: HEADERS });
    const users = await res.json();
    users.forEach((user) => following.push(user.login));
  }
  console.log(`Total Following: ${following.length}`);
  return following;
}

// OUTPUT list of random users:
async function get_random_users(following_list) {
  const pages = 30;
  console.log(`This may take a while... there are ${pages} pages to go through.`);

  let last_page = 1;
  try {
    last_page = parseInt(fs.readFileSync("last_page.txt"));
  } catch (error) {
    console.error(error);
  }

  let new_users = [];
  try {
    new_users = fs.readFileSync("new_users_list.txt", "utf8").split("\n").filter(Boolean);
  } catch (error) {
    console.error(error);
  }

  const fn = fs.createWriteStream("new_users_list.txt", { flags: "a" });
  let n_users = 0;
  for (let i = last_page; i < last_page + pages; i++) {
    const res = await sesh(`https://api.github.com/users?since=${i}`);
    const users = await res.json();
    for (const user of users) {
      if (!following_list.includes(user.login) && !new_users.includes(user.login)) {
        new_users.push(user.login);
        console.log(`Finding ${user.login}`);
        fn.write(`${user.login}\n`);
        n_users++;
      }
    }
  }
  fs.writeFileSync("last_page.txt", `${last_page + pages}`);
  fn.end();
  console.log(`Finding ${n_users} user`);
  return new_users;
}
