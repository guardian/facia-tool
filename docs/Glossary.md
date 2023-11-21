# Fronts Glossary

## Front

Represents curated content on a page. One Front has many [Containers](#container). A Fronts' containers are configured in the [config tool](https://fronts.gutools.co.uk/editorial/config).

![image9](https://user-images.githubusercontent.com/7767575/228781958-6d38f729-cee7-40cb-807e-c12c07cd7fc8.jpg)

## Container
A horizontal slice of a [Front](#front) containing [Cards](#card) and [Treats](#treat). One Container has many [Cards](#card). The contents of a container are modified in the Fronts tool. The layout/shape of a container is determined in the [config tool](https://fronts.gutools.co.uk/editorial/config). This example container also has ‘treats’ in it (weather and daily email sign up on the left hand side):

![image10](https://user-images.githubusercontent.com/7767575/228781965-9f719f22-5740-42fe-9756-8bc61ce9f623.jpg)

### Manual and automatic curation

Containers can contain content that is manually or automatically curated. Manually curated content is added in the Fronts tool.

We can also add content automatically. We can do this by setting the 'backfill' property of a container to add content from a CAPI query when the Front is [pressed](https://github.com/guardian/frontend/tree/main/facia-press). The backfill will added content _after_ any manually curated content, up to the card limit of the container, which is [hardcoded by the container presentation](https://github.com/guardian/facia-tool/blob/c93cb2cf838840dc037797241a0c93e4f5236b98/app/slices/Column.scala#L8). The query is set in the config tool. It commonly references a tag, as in this example:

<img width="815" alt="Screenshot 2023-03-30 at 10 07 27" src="https://user-images.githubusercontent.com/7767575/228787162-a28e8933-08bd-4947-a501-770a2c347d6f.png">

## Card
A Card represents a piece of content within a container, which might be an article, or a [snap link](#snaplinks).

## Treat
Treats are fixed on the left hand side of a container and typically contain a [snaplink](#snaplinks) – it could be something else, but this would be odd editorial behaviour. They display text but can be customised with html. Edited by going to the config tool and following the 'edit treats' link, which will link to the old Fronts tool (V1):

<img width="554" alt="Screenshot 2023-03-30 at 10 22 42" src="https://user-images.githubusercontent.com/7767575/228791325-4745b114-9faa-4ae2-ab63-29e33e3e2440.png">

Treats cannot be previewed.

## Snaplinks
A [Card](#card) that isn’t a direct reference to article. This can be:

- A tag page.
- A section page.
- A website.
- A custom bundle of HTML/JS/CSS to display arbitrary content – often [Thrashers](#thrasher).
- A link to the latest piece of content for a tag or section page.

As the last item suggests, you also create a ‘latest’ snap for tag or section pages. This displays the latest article available for that tag or section at the time of pressing. ‘Latest snaps’ have also been called ‘dream snaps’ in the past.

Create a snap by dragging a page link (front or tag page) into the fronts clipboard. If the snap represents a web page, the snap will be created immediately. If the snap represents a tag or a section, you will get a prompt:

<img width="684" alt="Screenshot 2023-03-30 at 09 51 55" src="https://user-images.githubusercontent.com/7767575/228785058-4693cedf-aa14-4855-abe3-3fba95514c73.png">

A 'Latest from' snaplink always displays latest item with the tag e.g. latest quick crossword. A 'Link' snaplink creates a link to the tag page or front.

## Thrasher

A Thrasher is a type of container. It's looked after by central production. Thrashers typically contain a single snaplink containing custom HTML/JS/CSS, provided by the Visuals team and hosted on interactive.guim.co.uk. The content is typically long lived.

![image1](https://user-images.githubusercontent.com/7767575/228781929-f1d843d0-76e1-4b97-bb9c-a5b639370ad5.jpg)

## Sparklines

The graph that appears next to some content to show the number of impressions over time, and the total number of impressions, for each piece of content over the past hour.

The graphs look like this – you'll only see them in production, as they require live Ophan data:

<img width="715" alt="Screenshot 2023-03-30 at 09 49 23" src="https://user-images.githubusercontent.com/7767575/228785040-d7c8592c-c07c-477f-8160-3405f472e9dd.png">

## Dynamo

A container with a dynamic layout. However when editorial refer to it they typically mean this layout:

![image11](https://user-images.githubusercontent.com/7767575/228781969-e0d2ccad-aa30-40d5-937d-028130c39452.jpg)

It’s typically used for a breaking news story. Dynamos are rendered differently from other containers. The Cambridge Analytica Files is a dynamo.

