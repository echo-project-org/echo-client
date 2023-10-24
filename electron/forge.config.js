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
        bin: "Echo",
        authors: 'Kury & zThundy',
        owners: 'Kury & zThundy',
        description: "Echo is a simple and secure messaging app that uses end-to-end encryption to keep your messages from being read by anyone but you and your intended recipients.",
        setupMsi: "EchoSetup.msi",
        setupExe: "EchoSetup.exe",
        setupIcon: path.join(process.cwd(), 'images', 'icon.ico'),
        iconUrl: path.join(process.cwd(), 'images', 'icon.ico'),
        noMsi: false,
        noDelta: false,
        // remoteReleases: "https://download.kuricki.com/updates/latest/",
      },
    },
    // {
    //   name: "@electron-forge/electron-wix",
    //   config: {
    //     language: 1033,
    //     manufacturer: "Kury & zThundy",
    //   }
    // },
    {
      name: '@electron-forge/maker-flatpak',
      config: {
        options: {
          categories: ['Video'],
          mimeType: ['video/h264']
        }
      }
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
