import url from '../constants/url';
import { Recipe } from '../types/Recipe';

interface KeyAndCount {
  key: string;
  doc_count: number;
}

export interface ChefSearchParams {
  query?: string;
  limit?: number;
}

export interface RecipeSearchFilters {
  diets?: string[];
  contributors?: string[];
  filterType: "During" | "Post";
}

export interface RecipeSearchParams {
  queryText: string;
  searchType?: "Embedded"|"Match"|"Lucene",
  fields?: string[];
  kfactor?: number;
  limit?: number;
  filters?: RecipeSearchFilters;
}

export interface ChefSearchResponse {

}

export interface RecipeSearchResponse {
  hits: number;
  maxScore: number;
  recipes: RecipeSearchHit[];
}

interface RecipeSearchTitlesResponse {
  score: number;
  href: string;
}

export type RecipeSearchHit = Recipe & {
  score: number;
}

export interface DietSearchResponse {
  "diet-ids": KeyAndCount[];
}

const widthParam = /width=(\d+)/;
export const updateImageScalingParams = (url:string) => {
  return url.replace(widthParam, "width=83")
}

const setupRecipeThumbnails = (recep:Recipe) => {
  try {
    return {
      ...recep,
      previewImage: recep.previewImage ? {
        ...recep.previewImage,
        url: updateImageScalingParams(recep.previewImage.url),
      } : undefined,
      featuredImage: recep.featuredImage ? {
        ...recep.featuredImage,
        url: updateImageScalingParams(recep.featuredImage.url),
      } : undefined
    }
  } catch(err) {
    console.error(err);
    return recep;
  }
}

const recipeQuery = (baseUrl:string) => {
  const fetchOne = async (href:string):Promise<Recipe|undefined> => {
    const response = await fetch(`${baseUrl}${href}`);

    switch(response.status) {
      case 200:
        const content = await response.json();
        return setupRecipeThumbnails(content as unknown as Recipe);
      case 404:
      case 403:
        console.warn(`Search response returned outdated recipe ${baseUrl}${href}`);
        return undefined;
      default:
        console.error(`Could not retrieve recipe ${href}: ${response.status}`);
        return undefined;
    }
  }

  const fetchAllRecipes = async (forRecipes:RecipeSearchTitlesResponse[]):Promise<RecipeSearchHit[]> => {
    const results = await Promise.all(
      forRecipes.map(r=>
        fetchOne(r.href)
          .then(recep=>recep ? ({
            ...recep,
            score: r.score,
          }) : undefined)
          .catch(console.warn)
      )
    )

    return results.filter(r=>!!r) as RecipeSearchHit[];
  }

  return {
    chefs: async (params:ChefSearchParams):Promise<ChefSearchResponse> => {
      const args = [
        params.query ? `q=${encodeURIComponent(params.query)}` : undefined,
        params.limit ? `limit=${encodeURIComponent(params.limit)}` : undefined
      ].filter(arg=>!!arg);

      const queryString = args.length > 0 ? '?' + args.join("&") : "";
      const url = `${baseUrl}/keywords/contributors${queryString}`;
      const response = await fetch(url);
      const content = await response.json();
      if(response.status==200) {
        return content as ChefSearchResponse;
      } else {
        console.error(content);
        throw new Error(`Unable to contact recipe API: ${response.status}`);
      }
    },
    diets: async ():Promise<DietSearchResponse> => {
      const response = await fetch(`${baseUrl}/keywords/diet-ids`);
      const content = await response.json();
      if(response.status==200) {
        return content as DietSearchResponse;
      } else {
        console.error(content);
        throw new Error(`Unable to contact recipe API: ${response.status}`);
      }
    },
    recipes: async (params: RecipeSearchParams):Promise<RecipeSearchResponse> => {
      const queryDoc = JSON.stringify(params);
      const response = await fetch(`${baseUrl}/search`, {
        method: "POST",
        body: queryDoc,
        mode: "cors",
        headers: new Headers({"Content-Type": "application/json"})
      });
      const content = await response.json();
      if(response.status==200) {
        const recipes = await fetchAllRecipes(content.results);
        return {
          hits: content.hits,
          maxScore: content.maxScore,
          recipes,
        }
      } else {
        console.error(content);
        throw new Error(`Unable to contact recipe API: ${response.status}`);
      }
    },
    recipesById: async (idList:string[]):Promise<Recipe[]> => {
      const responses = await Promise.all(
        idList.map(id=>fetch(`${baseUrl}/search/uid/${id}`,
          {
            redirect: "follow"
          }))
      );

      const successes = responses.filter((_)=>_.status===200);
      return Promise.all(
        successes.map((_)=>_.json())
      ) as Promise<Recipe[]>
    }
  }
}

export const liveRecipes = recipeQuery(url.recipes);
