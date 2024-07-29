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


const recipeQuery = (baseUrl:string) => {
  const fetchOne = async (href:string):Promise<Recipe|undefined> => {
    const response = await fetch(`${baseUrl}${href}`);
    const content = response.json();
    if(response.status==200) {
      return content as unknown as Recipe;
    } else {
      console.error(`Could not retrieve recipe ${href}: ${response.status}`);
      return undefined;
    }
  }

  const fetchAllRecipes = async (forRecipes:RecipeSearchTitlesResponse[]):Promise<RecipeSearchHit[]> => {
    const results = await Promise.all(
      forRecipes.map(r=>
        fetchOne(r.href).then(recep=>recep ? ({
          ...recep,
          score: r.score,
        }) : undefined)
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
    }
  }
}

export const liveRecipes = recipeQuery(url.recipes);
