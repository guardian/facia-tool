# Pointing the Fronts tool to CODE (or PROD!) CAPI

By convention, the Fronts CODE environment is pointed to PROD CAPI. This is to ensure that we're able to test live, production articles in a CODE environment, and preview them with `facia-press` and the Preview tool, which is also by convention pointed to PROD. (See the fronts [architecture diagram](https://github.com/guardian/frontend/blob/main/docs/02-architecture/02-fronts-architecture.md) for more information on how the fronts content pipeline is architected.)

Sometimes we need to be able to use content from CODE CAPI in the Fronts tool and Preview tool. To do this, we need to make two changes:

### Point `facia-tool` to CODE CAPI
- Go to the AWS CMS Fronts console (can be accessed from Janus)
- Download the `application secrets config` file from `s3://facia-private`.
- Modify the `content.api.host`, `content.api.draft.iam-host`, `content.api.draft.role` and `content.api.key` settings in this file to the CODE values which should be provided as comments in the file. (If not the case, the Content Platform team should be able to provide these.)
- In AWS, update the `facia-tool` CODE CloudFormation stack (`facia-CODE` at the time of writing), changing the `CapiPreviewRole` to match the CODE value of `content.api.draft.role` found in the conf file in the step above. This will allow the `facia-tool` boxes to communicate with the new endpoints you've just changed in the configuration.
- Redeploy the Fronts CODE tool on RiffRaff (recommend the latest main branch), which will refresh the configuration. You should see the feed of articles on the left hand side is now drawn from CAPI CODE.

### Point `facia-press` to CODE CAPI.

Contact the Dotcom team to do this, as they are the owners of `facia-press`.
