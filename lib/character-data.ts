import type { CharacterData } from '@/app/types';

let characterCache: Map<string, CharacterData> | null = null;

export async function loadCharacterData(): Promise<Map<string, CharacterData>> {
  if (characterCache) {
    return characterCache;
  }

  const response = await fetch('/data/characters.json');
  const data = await response.json();
  
  characterCache = new Map();
  
  for (const char of data.characters) {
    characterCache.set(char.character, char);
  }
  
  return characterCache;
}

export async function findCharacter(char: string): Promise<CharacterData | null> {
  const cache = await loadCharacterData();
  return cache.get(char) || null;
}
