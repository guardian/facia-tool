export interface FeastKeywordWithoutType {
	key: string;
	doc_count: number;
}

//NOTE - contributor is dealt with differently
export type FeastKeywordType = 'diet' | 'cuisine' | 'mealType' | 'celebration';

export interface FeastKeyword {
	id: string; //needed for compatibility with other Fronts code
	keywordType: FeastKeywordType;
	doc_count: number;
}

export type FeastKeywordResponse = Record<string, FeastKeywordWithoutType[]>;
