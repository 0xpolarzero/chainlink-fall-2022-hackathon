const CORRECT_SIGNATURE = '0xc06d127E504a944f63Bc750D8F512556c576F3EF';
const INCORRECT_SIGNATURE = '0X29F';

const mockTweets = [
  {
    text: 'This is a mock tweet',
  },
  {
    text: `This is a mock tweet with the signature ${CORRECT_SIGNATURE}`,
  },
];

module.exports = {
  CORRECT_SIGNATURE,
  INCORRECT_SIGNATURE,
  mockTweets,
};
