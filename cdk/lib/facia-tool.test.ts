import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { FaciaTool } from "./facia-tool";

describe("The FaciaTool stack", () => {
  it("matches the snapshot", () => {
    const app = new App();
    const stack = new FaciaTool(app, "FaciaTool", { stack: "cms-fronts", stage: "TEST" });
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
