/**
 * electron-builder afterPack hook.
 * Copies .next/standalone (including node_modules and .next/) into the
 * packaged app's Resources folder. electron-builder's extraResources
 * excludes node_modules and dotfiles by default, so we handle it here.
 */
const fs   = require('fs');
const path = require('path');

exports.default = async function afterPack(context) {
  const { appOutDir, packager } = context;
  const productName = packager.config.productName || 'FinTrack';
  const platform    = packager.platform.name; // 'mac', 'win', 'linux'

  let resourcesDir;
  if (platform === 'mac') {
    resourcesDir = path.join(appOutDir, `${productName}.app`, 'Contents', 'Resources');
  } else {
    resourcesDir = path.join(appOutDir, 'resources');
  }

  const src  = path.join(__dirname, '..', '.next', 'standalone');
  const dest = path.join(resourcesDir, 'standalone');

  if (!fs.existsSync(src)) {
    throw new Error(`afterPack: standalone not found at ${src}. Run "npm run build" first.`);
  }

  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }

  fs.cpSync(src, dest, { recursive: true });
  console.log(`afterPack: standalone → ${dest}`);
};
