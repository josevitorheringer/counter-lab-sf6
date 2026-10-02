export type Character = {
  id: number;
  name: string;
};

export const CHARACTERS: readonly Character[] = [
  { id: 1, name: "Ryu" },
  { id: 2, name: "Luke" },
  { id: 3, name: "Kimberly" },
  { id: 4, name: "Chun-Li" },
  { id: 5, name: "Manon" },
  { id: 6, name: "Zangief" },
  { id: 7, name: "JP" },
  { id: 8, name: "Dhalsim" },
  { id: 9, name: "Cammy" },
  { id: 10, name: "Ken" },
  { id: 11, name: "Dee Jay" },
  { id: 12, name: "Lily" },
  { id: 13, name: "A.K.I." },
  { id: 14, name: "Rashid" },
  { id: 15, name: "Blanka" },
  { id: 16, name: "Juri" },
  { id: 17, name: "Marisa" },
  { id: 18, name: "Guile" },
  { id: 19, name: "Ed" },
  { id: 20, name: "E. Honda" },
  { id: 21, name: "Jamie" },
  { id: 22, name: "Akuma" },
  { id: 25, name: "Sagat" },
  { id: 26, name: "M. Bison" },
  { id: 27, name: "Terry" },
  { id: 28, name: "Mai" },
  { id: 29, name: "Elena" },
  { id: 30, name: "C.Viper" },
  { id: 31, name: "Alex" },
  { id: 32, name: "Ingrid" },
  { id: 33, name: "Yasmin" },
] as const;

export function findCharacter(id: number): Character | undefined {
  return CHARACTERS.find((character) => character.id === id);
}
