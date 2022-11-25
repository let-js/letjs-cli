const MY_PLATFORM_ENV = process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE'];
const downloadDirectory = `${MY_PLATFORM_ENV}\\.letjs`;

module.exports = {
  downloadDirectory,
};
