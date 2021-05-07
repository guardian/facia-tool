# Editions Template Maintainance

Templates for Editions such as 'The Daily Edition' are stored in this application.

These are used to generate both the metadata relied on by the Editions app, and the
Fronts tool behaviour for creating issues of each Edition.

## Adding a new Template

Create a new file at `app/model/editions/templates/` called `<your-edition-name>.scala`

Ensure your new file is appropriately named and contains a single `object` which
extends `EditionDefinitionWithTemplate`. Ensure it fulfills all the requirements:

```
//noinspection TypeAnnotation
object MyLovelyHorseEdition extends EditionDefinitionWithTemplate {
  override val title = "My Lovely Horse"
  override val subTitle = "Published every morning by 6am (GMT)"
  override val edition = "my-lovely-horse-edition"
  override val header = Header("Horses!", "Lots of horses!")
  override val editionType = EditionType.Regional
  override val notificationUTCOffset = 3

  lazy val template = EditionTemplate(
  ...
```

NOTE: the `edition` property of your object must be a kebab case version of your object name otherwise the routing won't
work and you'll get a 404 error when creating an issue

Add the new Edition to _both_ the list of templates and the Edition enum object
in `app/model/editions/EditionsTemplates.scala`.

## Signing an image for use as a special edition icon

When defining an image in the template, we need to first sign the image and use the signed url.
You can do that here `http://image-url-signer.s3-website-eu-west-1.amazonaws.com/` but note you need to be on VPN.

