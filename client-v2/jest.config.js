module.exports = {
  transformIgnorePatterns: [
    '/node_modules/(?!panda-session|grid-util-js).+\\.js$'
  ],
  setupTestFrameworkScriptFile: './node_modules/jest-enzyme/lib/index.js',
  setupFiles: ['./src/setupTest.js'],
  moduleDirectories: ['<rootDir>/src', 'node_modules'],
  testURL: 'http://localhost',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/mocks/fileMock.js'
  }
};
