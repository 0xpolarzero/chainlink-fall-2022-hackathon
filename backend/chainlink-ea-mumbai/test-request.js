const { exec } = require('child_process');
require('dotenv').config();

// Just a function to try curl requests without using the shell

async function main() {
  const BEARER_TOKEN = process.env.BEARER_TOKEN;
  // Run a curl request in shell
  const curl = exec(
    `curl \
    -H "Authorization: Bearer ${BEARER_TOKEN}" \
    "https://api.twitter.com/2/users/by/username/TwitterDev?tweet.fields=&expansions="`,
  );
  curl.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
}

main();
