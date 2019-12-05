package services

case class Element(
                    id: String,
                    relation: String,
                    `type`: String,
                    assets: List[ImageAsset],
                    contentAtomTypeData: Option[ContentAtomTypeData]
                  )

case class ImageAsset(
                       `type`: String,
                       mimeType: Option[String],
                       file: String,
                       typeData: TypeData
                     )

case class TypeData(
                     width: Option[String]
                     // TODO and something like that [id: string]: unknown;
                     // look Capi.ts
                   )

case class ContentAtomTypeData(
                                atomId: String,
                                atomType: String
                              )

case class CapiArticleFields(
                              newspaperPageNumber: Int,
                              headline: String,
                              standfirst: String,
                              trailText: String,
                              byline: String,
                              internalPageCode: String,
                              isLive: Boolean,
                              firstPublicationDate: String,
                              scheduledPublicationDate: String,
                              lastModified: String,
                              secureThumbnail: String,
                              thumbnail: String,
                              liveBloggingNow: String,
                              shortUrl: String,
                              membershipUrl: String,
                            )

case class FrontsMeta(
                       defaults: FrontsMetaDefaults,
                       tone: Option[String],
                       cutout: Option[String],
                       pickedKicker: Option[String]
                     )

case class FrontsMetaDefaults(
                               imageCutoutReplace: Boolean,
                               imageHide: Boolean,
                               imageReplace: Boolean,
                               imageSlideshowReplace: Boolean,
                               isBoosted: Boolean,
                               isBreaking: Boolean,
                               showLargeHeadline: Boolean,
                               showByline: Boolean,
                               showKickerCustom: Boolean,
                               showKickerSection: Boolean,
                               showKickerTag: Boolean,
                               showLivePlayable: Boolean,
                               showMainVideo: Boolean,
                               showQuotedHeadline: Boolean,
                             )

case class Tag(
                id: String,
                `type`: String,
                webTitle: String,
                webUrl: String,
                bylineImageUrl: Option[String],
                bylineLargeImageUrl: Option[String],
                sectionId: Option[String],
                sectionName: Option[String],
              )

case class Blocks(
                   main: Option[Block],
                   body: Option[List[Block]]
                 )

case class Block(
                  id: String,
                  bodyHtml: String,
                  bodyTextSummary: String,
                  title: Option[String],
                  attributes: List[Any],
                  published: Boolean,
                  createdDate: Option[String],
                  firstPublishedDate: String,
                  publishedDate: Option[String],
                  lastModifiedDate: Option[String],
                  contributors: List[String],
                  createdBy: Option[User],
                  lastModifiedBy: Option[User],
                  elements: List[Element]
                )

case class User(email: String, firstName: Option[String], lastName: Option[String])

class CapiArticle(
                   id: String, `type`: String, webTitle: String, webUrl: String, urlPath: String, webPublicationDate: Option[String],
                   elements: List[Element],
                   pillarId: Option[String],
                   pillarName: Option[String],
                   sectionId: String,
                   sectionName: String,
                   fields: CapiArticleFields,
                   tags: Option[List[Tag]],
                   blocks: Blocks,
                   atoms: Option[Atom],
                   isHosted: Option[Boolean],
                   frontsMeta: FrontsMeta
                 )

case class Atom(id: String, atomType: String, data: AtomData)

case class AtomData(media: MediaAtom)

case class MediaAtom(assets: List[AtomAsset])

case class AtomAsset(assetType: String)
