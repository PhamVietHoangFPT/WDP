module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env", // This defines the alias you're using for imports
        path: "./.env", // This is the default path to your .env file
        safe: false,
        allowUndefined: true,
        // other options if needed
      },
    ],
  ],
};
