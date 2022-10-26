import { TwitterApi } from 'twitter-api-v2';

const userClient = new TwitterApi({
  appKey: process.env.NEXT_PUBLIC_TWITTER_API_KEY,
  appSecret: process.env.NEXT_PUBLIC_TWITTER_API_SECRET,
  accessToken: process.env.NEXT_PUBLIC_TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.NEXT_PUBLIC_TWITTER_ACCESS_SECRET,
});

export default function TwitterVerificationAPI() {
  return (
    <div>
      <h1>Twitter Verification API</h1>
      <p>Twitter Verification API</p>
    </div>
  );
}
