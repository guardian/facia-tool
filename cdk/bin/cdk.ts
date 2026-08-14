import "source-map-support/register";
import { GuRoot } from "@guardian/cdk/lib/constructs/root";
import { FaciaTool } from "../lib/facia-tool";

const app = new GuRoot();
new FaciaTool(app, "FaciaTool-euwest-1-CODE", {
  stack: "cms-fronts",
  stage: "CODE",
  env: { region: "eu-west-1" },
  cloudFormationStackName: "facia-CODE",
});
new FaciaTool(app, "FaciaTool-euwest-1-PROD", {
  stack: "cms-fronts",
  stage: "PROD",
  env: { region: "eu-west-1" },
  cloudFormationStackName: "facia-PROD",
});
