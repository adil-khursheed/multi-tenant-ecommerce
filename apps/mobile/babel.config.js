module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./",
            "react-native-device-info": "./react-native-device-info.ts",
          },
        },
      ],
    ],
  };
};
