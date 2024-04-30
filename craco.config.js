const nodeExternals = require("webpack-node-externals");
module.exports = {
  webpack: {
    resolve: {
      fullySpecified: false
    },
    configure: {
      target: "electron-renderer",
      externals: [
        nodeExternals({
          allowlist: [/webpack(\/.*)?/, "electron-devtools-installer"],
        }),
      ],
    }
  },
};