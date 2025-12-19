const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config plugin to remove storage permissions from AndroidManifest.xml
 * This ensures the app doesn't request READ/WRITE_EXTERNAL_STORAGE permissions
 * even if dependencies try to add them.
 */
module.exports = function withRemoveStoragePermissions(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest) {
      return config;
    }

    // Remove storage permissions if they exist
    const permissionsToRemove = [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ];

    if (manifest['uses-permission']) {
      manifest['uses-permission'] = manifest['uses-permission'].filter(
        (permission) => {
          const permissionName = permission.$['android:name'];
          return !permissionsToRemove.includes(permissionName);
        }
      );
    }

    return config;
  });
};

