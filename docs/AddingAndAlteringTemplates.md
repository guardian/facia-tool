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

## Special Editions

Special Editions have additional values that can be set. Here's a typical Special Edition configuration.
Note that we can provide an image, as well as define the presentation of additional text fields.

```
//noinspection TypeAnnotation
object EditionBadYear extends SpecialEdition {
  override val title = "The best of\na bad year"
  override val subTitle = "A special, one-off Guardian digital supplement for the year we'd rather forget"
  override val edition = "edition-bad-year"
  override val header = Header(title ="The best of", subTitle=Some("a bad year"))
  override val notificationUTCOffset = 3
  override val topic = "e-by"
  override val buttonImageUri = Some("https://i.guim.co.uk/img/media/6426f7cc8b9df19b21d065888dd3918883fef9d6/0_0_185_90/185.png?width=67&quality=100&s=657a9aee4130c4f8c79469f8b0c31351")
  override val expiry: Option[String] = Some(
    new DateTime(2021, 1,23,23,59,DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#c1d8fc",
      title = EditionTextFormatting(color = "#000000", font="GHGuardianHeadline-Light", lineHeight = 34, size = 34),
      subTitle = EditionTextFormatting(color = "#000000", font="GuardianTextSans-Bold", lineHeight = 20, size = 17),
      expiry = EditionTextFormatting(color = "#000000", font="GuardianTextSans-Regular", lineHeight = 16, size = 15),
      image = EditionImageStyle(67,134)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#c1d8fc",
      textColorPrimary = "#000000",
      textColorSecondary = "#000000"
    )
  )
```
Here's a quick rundown on what gets used where:

`buttonImageUri` this provides the icon in the image picker. For the best outcome, create a 67px square PNG and run it through the image resizer to provide the crop url.


