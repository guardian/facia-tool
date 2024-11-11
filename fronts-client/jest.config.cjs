module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js)$': 'ts-jest',
  },
  testMatch: ['<rootDir>/src/**/*.spec.+(ts|tsx|js)'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(panda-session|grid-util-js)/)',
  ],
  setupFiles: ['./config/setupTest.js'],
  moduleDirectories: ['<rootDir>/src', 'node_modules'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/mocks/fileMock.js',
    '\\.css$': '<rootDir>/mocks/styleMock.js',
  },
};
