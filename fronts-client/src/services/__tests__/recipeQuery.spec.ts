import { updateImageScalingParams } from '../recipeQuery';

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
