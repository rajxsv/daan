import appJson from './app.json';

module.exports = {
  name: 'myapp',
  version: '1.0.0',
  expo: {
    ...appJson.expo,
    plugins: [
      "expo-web-browser"
    ],
  },
  extra: {
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  },
};