const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
module.exports = {
  output: {
    uniqueName: "login-remote",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },   
  plugins: [
    new ModuleFederationPlugin({
      name: "loginRemote",
      filename: "remoteEntry.js",
      // The host lazy-loads this Angular feature module at /login.
      exposes: {
        "./LoginModule": "./projects/login-remote/src/app/login/login.module.ts"
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
        "@angular/common": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
        "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
        "@angular/forms": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
        "@angular/router": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
        rxjs: { singleton: true, strictVersion: true, requiredVersion: "6.6.7" }
      }
    })
  ],
};
