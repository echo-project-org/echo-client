const path = require('path');
const fs = require('fs');

module.exports = {
  packagerConfig: {
    asar: true, // ?????
    icon: path.join(process.cwd(), 'images', 'icon.png')
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        bin: "Echo"
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        bin: "Echo"
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        bin: "Echo",
        options: {
          icon: path.join(process.cwd(), 'images', 'icon.png'),
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        bin: "Echo",
        icon: path.join(process.cwd(), 'images', 'icon.png'),
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ],
  hooks: {
    packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
      console.log("File copy hook")
      console.log(process.cwd())
      var src = path.join(process.cwd(), "../echo", "build");
      console.log(src);
      var dst = buildPath;
      fs.cpSync(src, dst, {recursive: true});
    }
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'KuryGabriele',
          name: 'echo-project'
        },
        prerelease: true
      }
    }
  ]
};
