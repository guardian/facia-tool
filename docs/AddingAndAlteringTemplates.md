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

## Special edition buttonImageUri
When adding a special edition, you need to include an image to include for the icon of the edition in the editions menu.
This (technically) can be any image URL, but you should use a properly compressed image of the right size. But what is the
right size? The current default (code is [here](https://github.com/guardian/editions/blob/master/projects/Mallard/src/components/EditionsMenu/SpecialEditionButton/styles.ts#L60))
is a width of 87 and height of 134, but you can control this using the buttonStyle.image property on your edition.

How to get such an image? Go to the grid, find and crop the image, then on your crop in the bottom right click 'show crops'
then right click on the biggest crop and 'copy image location'. Next, connect to the digital VPN and use the
[image url signer tool](http://image-url-signer.s3-website-eu-west-1.amazonaws.com/) to resize the image to a sensible size
(you can probably use the default compression but make sure you specify a sensible width, no need to specify height).
