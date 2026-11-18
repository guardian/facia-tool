/* eslint-disable no-undef -- jest globals are missing due to guardian.recommended.jest eslint rules not covering jest.setup.js */
jest.mock("@guardian/cdk/lib/constants/tracking-tag");
// Swaps in the library's shipped placeholder ids, so real account ids stay out of the snapshots.
jest.mock("@guardian/aws-account-setup");
