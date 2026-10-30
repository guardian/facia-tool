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

