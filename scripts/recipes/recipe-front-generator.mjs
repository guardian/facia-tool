#!/usr/bin/env node

//A preset list of containers that we can select from
import crypto from 'crypto';

const usage = `This script (aka Kitchen Ipsum Generator :-D) builds kinda sensible-looking fronts based on a set list of titles
and semantic search.

Example usage is

./recipe-front-generator.mjs
    --stage LOCAL
    --fronts-issue-id 9d58078c-f9d8-4c27-8949-5c1dc8d2bfe5
    --front-name 'All Recipes'
    --cookie "$AUTH_COOKIE"
    --collection-count 7
    [--filter vegetarian]
stage - set this to LOCAL or CODE. Don't run against PROD.
fronts-issue-id - the issue containing the fronts to populate. Get this from the browser address bar in Fronts tool (e.g., https://fronts.local.dev-gutools.co.uk/v2/issues/9d58078c-f9d8-4c27-8949-5c1dc8d2bfe5)
front-name - either 'All Recipes' or 'Meat-Free'. Note that it needs to exist already.
cookie - set of cookies containing authorization. Get this by going into the Network tab, reloading your Front, finding a network request and copying the headers.
filter - can be set to 'veg' or 'vegetarian' to restrict to only vegetarian recipes.
I tend to then set this into an environment variable to make by console buffer more readable
collection-count - number of collections to generate. Defaults to 1 if not specified.
`;

const containerNames = [
    "Flavors of the World: A Culinary Adventure",
    "Quick & Tasty: Meals in 30 Minutes or Less",
    "Cozy Comfort: Recipes for Rainy Days",
    "Fresh & Light: A Taste of Summer",
    "Farm to Table: Fresh, Seasonal Delights",
    "Spice It Up: Bold Dishes for Adventurous Eaters",
    "Soul-Warming Stews for Cold Nights",
    "From the Oven: Bakes to Satisfy Any Craving",
    "Simply Delicious: 5-Ingredient Wonders",
    "One-Pot Magic: Easy Dishes, Minimal Cleanup",
    "Plant-Powered: Vibrant Vegan Creations",
    "Sweet Tooth Heaven: Desserts to Indulge In",
    "Family Favorites: Meals to Make Everyone Smile",
    "Weekend Brunch Goals: Recipes to Impress",
    "The Italian Kitchen: Pasta, Pizza, and More",
    "Healthy, Wholesome, & Hearty Bowls",
    "Sizzle & Sear: Grilled Goodness All Year Long",
    "Bringing the Heat: Fiery Flavors You'll Love",
    "Sweet & Savory Fusion: Unique Flavor Combos",
    "Global Comfort Foods: Your Favorite Dishes Reimagined",
    "Deliciously Decadent: Indulge in Every Bite",
    "Street Food Staples from Around the World",
    "Feast Your Eyes: Gourmet Meals Made Easy",
    "Healthy Habits: Nutritious Meals That Satisfy",
    "Hearty & Homestyle: Classic Comfort Dishes",
    "Elevated Everyday: Simple Meals, Sophisticated Taste",
    "Dinner Party Perfection: Dishes to Impress Guests",
    "Mediterranean Marvels: Fresh and Flavorful",
    "Master the Grill: Recipes for BBQ Lovers",
    "Crispy, Crunchy, & Full of Flavor",
    "Sweet Beginnings: Breakfast & Brunch Treats",
    "Summer BBQ Essentials: Flame-Kissed Goodness",
    "Flavors of Fall: Seasonal Recipes to Savor",
    "Aromatic & Rich: Perfect Curry Recipes",
    "Simple Snacks: Tasty Bites for Every Occasion",
    "Coastal Cooking: Seafood Recipes to Dive Into",
    "Warming Soups & Stews for Every Season",
    "Quick Bites: Appetizers for Any Occasion",
    "Baked to Perfection: Savory & Sweet Delights",
    "Wrap It Up: Easy and Delicious Wrap Recipes",
    "Delicious Detox: Clean Eating Recipes",
    "The Sweetest Treats: Baking Bliss Awaits",
    "Bold Flavors, Simple Prep: Quick Gourmet Meals",
    "Ultimate Game Day Grub: Crowd-Pleasing Snacks",
    "Feel-Good Foods: Healthy and Hearty",
    "Satisfy Your Cravings: Comfort Foods Redefined",
    "Light & Lovely: Perfect Salads for Any Meal",
    "Gluten-Free Goodies Everyone Will Love",
    "Breakfast in Bed: Recipes to Start the Day Right",
    "Ultimate Meat Lover’s Menu",
    "Under 500 Calories: Guilt-Free Gourmet",
    "For the Love of Chocolate: Irresistible Desserts",
    "Easy Entertaining: No-Fuss Party Foods",
    "Satisfying Sides: Perfect Complements to Any Meal",
    "Asian Fusion Feasts: Bold, Unique Flavors",
    "Lighter Fare: Meals That Won't Weigh You Down",
    "Sundays Made Simple: Slow Cooker Comfort",
    "Finger Food Fun: Deliciously Dippable Recipes",
    "Quick Fix: Weeknight Meals in a Flash",
    "Savory Sensations: Satisfying Soups to Savor",
    "Rustic Elegance: Country-Inspired Recipes",
    "Savory & Sweet: Perfect Pairings for Every Palate",
    "Tacos & Tequila: Mexican-Inspired Meals",
    "Lunchbox Love: Easy Meals to Take On-the-Go",
    "A Taste of the Tropics: Exotic Island Flavors",
    "Superfoods for Super You: Power-Packed Plates",
    "Midnight Munchies: Late Night Snacks You’ll Love",
    "Guilt-Free Desserts You Can’t Resist",
    "Pizza Party: Creative and Fun Toppings",
    "Fiesta Flavors: Mexican Favorites You’ll Adore",
    "Savory Bites: Delicious Dinner Ideas",
    "One-Pan Wonders: Fuss-Free Cooking",
    "Hearty Breakfasts to Fuel Your Day",
    "Tapas & Small Plates: Bite-Sized Bliss",
    "Picnic Perfection: Easy, Portable Recipes",
    "On a Roll: Perfect Sandwiches and Wraps",
    "Cheesy Comforts: Melty, Gooey Delights",
    "Heavenly Homestyle Baking: Recipes to Cherish",
    "Fresh From the Garden: Herb & Veggie-Packed Dishes",
    "A Taste of Italy: Recipes for Italian Food Lovers",
    "Fiery & Flavorful: Spicy Dishes to Heat Things Up",
    "Indulgent & Irresistible: Rich Dishes to Savor",
    "Refreshing & Light: Drinks and Smoothies to Sip",
    "Quick, Easy, & Delicious Breakfast Ideas",
    "Creamy & Dreamy: Comforting Pasta Dishes",
    "Flourless Feasts: Gluten-Free Wonders",
    "Slow-Cooked Success: Low & Slow, Big Flavor",
    "Bite-Sized Bliss: Perfect Hors d'Oeuvres",
    "A Dash of Citrus: Zesty Recipes That Shine",
    "Hearty Grain Bowls for Everyday Energy",
    "Sizzle & Spice: Southeast Asian Sensations",
    "Savory Pies: Perfect for Every Meal",
    "Breakfast Boost: Start Your Day Right",
    "Farmhouse Flavors: Rustic Recipes That Warm the Heart",
    "Satisfying Smoothies for Anytime",
    "Decadent Dinners: Treat Yourself Tonight",
    "Savory Brunch Ideas for Lazy Mornings",
    "Flour Power: Master the Art of Baking",
    "Festive Feasts: Holiday Recipes for Celebration",
    "Healthy Starts: Energizing Breakfast Recipes",
    "Global Grains: A World of Delicious Grains",
    "Perfect for Sharing: Family-Style Meals",
    "Sweet & Savory Creations for Any Mood"
]
const recipeBase = "https://recipes.code.dev-guardianapis.com";
const getArg = (flag, optional = false) => {
    const argIdx = process.argv.indexOf(flag);
    const arg = argIdx !== -1 ? process.argv[argIdx + 1] : undefined;

    if (!arg && !optional) {
        console.error(`No argument for ${flag} given. ${usage}`);
        process.exit(2);
    }

    return arg;
};

class ContinueOnError extends Error {

}

const getFrontsUri = () => {
    switch(stage.toLocaleUpperCase()) {
        case "PROD":
            throw new Error("Don't run this against PROD")
        case "CODE":
            return "https://fronts.code.dev-gutools.co.uk";
        case "LOCAL":
            return "https://fronts.local.dev-gutools.co.uk";
        default:
            throw new Error("--stage must be one of CODE or LOCAL")
    }
}

const stage = getArg("--stage");
const frontsBaseUrl = getFrontsUri();
const frontsIssueId = getArg("--fronts-issue-id");
const collectionCount = parseInt(getArg("--collection-count", true) ?? "1");
const minRecipes = 2;
const maxRecipes = 8;
const frontName = getArg("--front-name");
const cookie = getArg("--cookie");
const filter = getArg("--filter", true);
const frontsHeaders = {
    "Content-Type": "application/json",
    Cookie: cookie,
};

/**
 * Returns a batch of recipes from the search backend, in this format:
 * {
 *     "hits": 61,
 *     "maxScore": 0.8703575,
 *     "results": [
 *         {
 *             "score": 0.8703575,
 *             "title": "Courgette and samphire",
 *             "href": "/content/hSase0evm9VrxXxt9SP8_HWpDmpFQ9_I_rK_mC8S1aw",
 *             "composerId": "57864e17e4b02d747b53cae5"
 *         },
 *         ....
 * }
 * @param searchString
 * @param count
 * @return {Promise<any>}
 */
async function findRecipes(searchString, count, meatFree) {
    console.debug(`search term is '${searchString}'`);
		const baseUrl = `${recipeBase}/search?q=${encodeURIComponent(searchString)}&format=Full&limit=${count}`;
		const url = meatFree ? baseUrl + '&dietFilter=vegetarian' : baseUrl;
    const response = await fetch(url);
    if(response.status !== 200) {
        const content = await response.text();
        console.error(`Server error ${response.status}: ${content}`);
        throw new Error("Unable to search for matching recipes")
    }
    return response.json();
}

/**
 * Takes in a recipe index structure and turns it into a recipe card
 * @param recipeIndexEntry
 */
function buildCard(recipeIndexEntry) {
    if(!recipeIndexEntry.id) throw new Error("Can't build card as recipeIndexEntry has no id");
    return {
        uuid: crypto.randomUUID(),
        frontPublicationDate: Date.now(),
        cardType: 'recipe',
        id: recipeIndexEntry.id
    }
}

/**
 * Creates a new collection in the given front
 * @param collectionName
 * @param frontId
 * @return {Promise<*>} the ID of the collection that was just created
 */
async function makeNewCollection(collectionName, frontId) {
    const newCollectionResponse = await fetch(
        `${frontsBaseUrl}/editions-api/fronts/${frontId}/collection?name=${encodeURIComponent(collectionName)}`,
        {
            method: "PUT",
            headers: frontsHeaders,
        }
    );

    if (newCollectionResponse.status !== 200) {
        console.error(
            `Error creating new collection: ${
                newCollectionResponse.status
            } ${
                newCollectionResponse.statusText
            } ${await newCollectionResponse.text()}`
        );
        throw new Error("Unable to create collection")
    } else {
        console.log(
            `Collection with title '${collectionName}' added to front ${frontId}`
        );
    }

    const responseBody = await newCollectionResponse.json();
    //We always insert a new collection at the top
    return responseBody[0].id;
}

async function updateCollectionContents(collectionId, collectionName, cards) {
    const body = JSON.stringify({
        collection: {
            id: collectionId,
            isHidden: false,
            lastUpdated: Date.now(),
            updatedBy: "autofill script",
            updatedEmail: "andy.gallagher@guardian.co.uk",
            displayName: collectionName,
            items: cards
        },
        id: collectionId
    })
    const response = await fetch(
        `${frontsBaseUrl}/editions-api/collections/${collectionId}`,
        {
            method: "PUT",
            headers: frontsHeaders,
            body,
        }
    );

    if(response.status!==200) {
        const contentText = await response.text();
        throw new Error(`Unable to update collection with ID ${collectionId}, server said ${response.status} ${contentText}`)
    }

    return response.json();
}

function searchTermFromCollectionName(collectionName) {
    const indexOfColon = collectionName.lastIndexOf(':');
    if(indexOfColon>0) {
        return collectionName.substring(indexOfColon+1).trim();
    } else {
        return collectionName;
    }
}

async function buildCollection(collectionName, frontId, count) {
    const recipes = await findRecipes(searchTermFromCollectionName(collectionName), count, filter==='veg' || filter==='vegetarian');   //use the collectionName as a search string
    if(recipes.maxScore < 0.7) {
        throw new ContinueOnError(`No reliable results for '${collectionName} as a search string`);
    }
    console.log(`Selected ${recipes.results.length} recipes with max confidence of ${recipes.maxScore}`);
    recipes.results.forEach((r)=>console.log(`\t${r.title} ${r.contributors}`));

    const newCollectionId = await makeNewCollection(collectionName, frontId);
    const recipeCards = recipes.results.map(buildCard);
    await updateCollectionContents(newCollectionId, collectionName, recipeCards);
}

async function frontNameToId(issueId, frontName) {
	const response = await fetch(
        `${frontsBaseUrl}/editions-api/issues/${issueId}`,
        {
            method: "GET",
            headers: frontsHeaders,
        }
    );
    if(response.status!==200) {
        const contentText = await response.text();
        throw new Error(`Unable to map name to ID, server said ${response.status} ${contentText}`);
    }
    const content = await response.json();
    const matches = content.fronts.filter((_)=>_.displayName===frontName);
    if(matches.length>0) {
        return matches[0].id;
    } else {
        return undefined;
    }
}

// START MAIN
const frontId = await frontNameToId(frontsIssueId, frontName);
console.log(`ID of front ${frontName} is ${frontId}. Looking to generate ${collectionCount} collections`);

for(let i=0; i<collectionCount; i++) {
    const titleSelector = crypto.randomInt(containerNames.length - 1);
    const targetRecipeCount = crypto.randomInt(minRecipes, maxRecipes);
    console.log(`Generating a collection of ${targetRecipeCount} for '${containerNames[titleSelector]}`);

    try {
        await buildCollection(containerNames[titleSelector], frontId, targetRecipeCount);
    } catch(err) {
        if(err instanceof ContinueOnError) {
            console.warn(err);
        } else {
            console.error(err);
            break;
        }
    }
}
