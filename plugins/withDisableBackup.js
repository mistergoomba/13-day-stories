const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config plugin to disable Android Auto Backup
 * This prevents app data from being restored after uninstall/reinstall,
 * ensuring that "Clear Data" actually clears all user data.
 */
module.exports = function withDisableBackup(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest) {
      return config;
    }

    // Find the application tag and set allowBackup to false
    if (manifest.application && manifest.application.length > 0) {
      const application = manifest.application[0];
      if (application.$) {
        application.$['android:allowBackup'] = 'false';
      }
    }

    return config;
  });
};

