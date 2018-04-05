module.exports = {
  transformIgnorePatterns: ['/node_modules/(?!panda-session).+\\.js$'],
  setupTestFrameworkScriptFile: './node_modules/jest-enzyme/lib/index.js',
  setupFiles: ['./src/setupTest.js']
};
