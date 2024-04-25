# Github Follow Api

This tool helps you analyze and manage your GitHub network of followers and the users you're following. It uses the GitHub API to fetch and process data about your network, allowing you to find users you're not following back, discover new users to follow, and more.

## Prerequisites

- Node.js installed on your system.
- A GitHub personal access token with the necessary permissions.
- If don't know how, refer to [generating personal access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)

- create .env file in your directory and replace fields

  ```
    GITHUB_TOKEN= your github token
    GITHUB_USERNAME = your username
  ```

- create a exception.txt file in your directory and add users you don't want to unfollow

## Installation

- Clone this repository or download the script file for http
  ```
  git clone https://github.com/vickkie/github-follow-api.git
  ```
- or (for ssh)

  ```
   git clone git@github.com:vickkie/github-follow-api.git
  ```

- Install the required Node.js modules by running
  ```
  npm install
  ```

### Usage

- Run the scripts with the following commands:

| Command              | Description                                                                        |
| -------------------- | ---------------------------------------------------------------------------------- |
| `npm run start`      | Run the program with the script that analyzes and lists non-followers              |
| `npm run check`      | Checks who is not following you back and creates list                              |
| `npm run unfollow`   | Unfollows users you don't want to follow using the list created by `npm run check` |
| `npm run discover`   | Find new users to follow based on your followers and the users you're following    |
| `npm run followback` | Follow back users who are following you back                                       |
| `npm run new-users`  | Find new users to follow based on your followers and the users you're following    |

### Contributing

- Contributions are welcome! Please feel free to submit issues or pull requests.

### License

- This project is licensed under the MIT License.

#### Madeby @uzitrake

- with ~~love~~ javascript
