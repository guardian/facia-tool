import { updateImageScalingParams, liveRecipes } from '../recipeQuery';
import fetchMock from 'fetch-mock';

describe("updateImageScalingParams", ()=>{
  it("should correctly update a URL with scaling params", ()=>{
    expect(updateImageScalingParams("https://i.guim.co.uk/img/media/8c8aafb89d2467f41d5cf9d1324f815fee71d54c/0_168_4080_5101/master/4080.jpg?width=1600&dpr=1&s=none"))
      .toEqual("https://i.guim.co.uk/img/media/8c8aafb89d2467f41d5cf9d1324f815fee71d54c/0_168_4080_5101/master/4080.jpg?width=83&dpr=1&s=none")
  });

  it("should not touch a URL without scaling params", ()=>{
    expect(updateImageScalingParams("https://media.guim.co.uk/9d66c5c65237d92720f657cf839b7754e0973286/527_409_4231_2539/500.jpg"))
      .toEqual("https://media.guim.co.uk/9d66c5c65237d92720f657cf839b7754e0973286/527_409_4231_2539/500.jpg")
  })
});

describe("recipeQueries.recipes", ()=>{
  afterEach(()=>{
    fetchMock.restore();
  });

  it("should pull in all returned recipes and embellish them with the score", async ()=>{
    const body = JSON.stringify({
      results: [
        {
          score: 0.8,
          href: "/content/content1"
        },
        {
          score: 0.7,
          href: "/content/content2"
        }
      ],
      maxScore: 0.8,
      hits: 2
    });

    fetchMock.mock("https://recipes.guardianapis.com/search", 200, {
      response: {
        body,
      },
      method: "POST"
    });

    fetchMock.mock("https://recipes.guardianapis.com/content/content1", 200, {
      response: {
        body: JSON.stringify({fake: "content here"})
      }
    });

    fetchMock.mock("https://recipes.guardianapis.com/content/content2", 200, {
      response: {
        body: JSON.stringify({more_fake: "content here"})
      }
    });

    const response = await liveRecipes.recipes({
      queryText: "blah",
      filters: {
        diets: ["pescatarian"],
        filterType: "Post"
      }
    });

    expect(response.recipes.length).toEqual(2);
    expect(response.recipes[0].score).toEqual(0.8);
    expect(response.recipes[1].score).toEqual(0.7);
    expect(response.hits).toEqual(2);
    expect(response.maxScore).toEqual(0.8);
  });

  it("should ignore invalid urls", async ()=>{
    const body = JSON.stringify({
      results: [
        {
          score: 0.8,
          href: "/content/content1"
        },
        {
          score: 0.7,
          href: "/content/content2"
        }
      ],
      maxScore: 0.8,
      hits: 2
    });

    fetchMock.mock("https://recipes.guardianapis.com/search", 200, {
      response: {
        body,
      },
      method: "POST"
    });

    fetchMock.mock("https://recipes.guardianapis.com/content/content1", 403, {
      response: {
        status: 403,
        body: "<html><body><h1>Content is not here!</h1></body></html>"
      }
    });

    fetchMock.mock("https://recipes.guardianapis.com/content/content2", 200, {
      response: {
        status: 200,
        body: JSON.stringify({more_fake: "content here"})
      }
    });

    const response = await liveRecipes.recipes({
      queryText: "blah",
      filters: {
        diets: ["pescatarian"],
        filterType: "Post"
      }
    });

    expect(response.recipes.length).toEqual(1);
    expect(response.recipes[0].score).toEqual(0.7);
    expect(response.hits).toEqual(2);
    expect(response.maxScore).toEqual(0.8);
  });

  it("should ignore corrupted content", async ()=>{
    const body = JSON.stringify({
      results: [
        {
          score: 0.8,
          href: "/content/content1"
        },
        {
          score: 0.7,
          href: "/content/content2"
        }
      ],
      maxScore: 0.8,
      hits: 2
    });

    fetchMock.mock("https://recipes.guardianapis.com/search", 200, {
      response: {
        body,
      },
      method: "POST"
    });

    fetchMock.mock("https://recipes.guardianapis.com/content/content1", 200, {
      response: {
        body: "THIS IS NOT JSON!"
      }
    });

    fetchMock.mock("https://recipes.guardianapis.com/content/content2", 200, {
      response: {
        body: JSON.stringify({more_fake: "content here"})
      }
    });

    const response = await liveRecipes.recipes({
      queryText: "blah",
      filters: {
        diets: ["pescatarian"],
        filterType: "Post"
      }
    });

    expect(response.recipes.length).toEqual(1);
    expect(response.recipes[0].score).toEqual(0.7);
    expect(response.hits).toEqual(2);
    expect(response.maxScore).toEqual(0.8);
  });

})
