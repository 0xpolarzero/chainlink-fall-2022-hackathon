const CORRECT_ADDRESS = '0xc06d127E504a944f63Bc750D8F512556c576F3EF';
const INCORRECT_ADDRESS = '0x8e2c250A85D97c94405471C261BF28feC5D6b0c9';
const SIGNATURE = `Verifying my Twitter account for ${CORRECT_ADDRESS} with @usePromise!`;

const mockTweets = [
  {
    text: 'This is a mock tweet',
  },
  {
    text: `Mock tweet: ${SIGNATURE}`,
  },
];

module.exports = {
  CORRECT_ADDRESS,
  INCORRECT_ADDRESS,
  SIGNATURE,
  mockTweets,
};
