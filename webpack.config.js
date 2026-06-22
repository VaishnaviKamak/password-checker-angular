const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
module.exports = {
  output: {
    uniqueName: "angular11-password-checker",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },   
  plugins: [
    new ModuleFederationPlugin({
      // Remote containers are served independently and consumed by shell routes.
      remotes: {
        loginRemote: "loginRemote@http://localhost:4201/remoteEntry.js",
        signupRemote: "signupRemote@http://localhost:4202/remoteEntry.js"
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
