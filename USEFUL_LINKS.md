#Instructions for developers
- The client side of the fronts tool uses [knockout](http://knockoutjs.com/)
- The backend uses Play

##The app
1. A page where you can edit the articles in a front
   * This is found at `https://fronts.local.dev-gutools.co.uk/{editorial|commercial|training}`, depending on whether you want to edit editorial, commercial or training fronts
   * Training fronts are not fronts that appear on the website, but they are used for training purposes
2. A page for configuring and creating new fronts
   * Found at `https://fronts.local.dev-gutools.co.uk/{editorial|commercial|training}/config`
   * Don't confuse this with `https://fronts.local.dev-gutools.co.uk/config` which will display the contents of the fronts configuration bucket.

##Dragging images from the grid
- You can drag an image to a front from the grid [here](https://media.test.dev-gutools.co.uk/search). To use an image you need to make a 5:3 crop of it first using the grid.

##Rendering the front on front-end
- If you are adding new kind of content to a front or changing the front configuration, you should check that the front still appears on frontend.

- To do so, edit the articles appearing on a front, launch the front and check that your changes are appearing here: `http://m.code.dev-theguardian.com/{name-of-front}`

- If the front that you are trying to view cannot be found, it is probably because
the front is hidden.
- You can remove this property from the front in the fronts config page.
- Select the front your are trying to view on the config page, click on the edit-metadata link, and deselect is hidden-property.

