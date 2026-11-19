/**
 * We need to mock out the FeastGraphQL service, since the module bundle is not compatible with the Jest setup
 * in this repository (and we mock its methods in tests with jest.Mock() anyway).
 * It's safer to do this than to mess with the entire Jest setup for the purpose of bringing in a module which is not
 * even tested
 */
class FeastGraphQL {
  constructor() {}
  faciaChefSearch() {
    return Promise.resolve([]);
  }
  faciaRecipeSearch() {
    return Promise.resolve({ results: [], maxScore: 0 });
  }
  getRecipeBatch() {
    return Promise.resolve([]);
  }
}

module.exports = { FeastGraphQL };

