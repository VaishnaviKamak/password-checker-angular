const baseConfig = require('./webpack.config');
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

const mfPluginIndex = baseConfig.plugins.findIndex(
  p => p.constructor && p.constructor.name === 'ModuleFederationPlugin'
);

if (mfPluginIndex !== -1) {
  baseConfig.plugins[mfPluginIndex] = new ModuleFederationPlugin({
    remotes: {},
    shared: {
      "@angular/core": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
      "@angular/common": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
      "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
      "@angular/forms": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
      "@angular/router": { singleton: true, strictVersion: true, requiredVersion: "11.2.14" },
      rxjs: { singleton: true, strictVersion: true, requiredVersion: "6.6.7" }
    }
  });
}

module.exports = baseConfig;
