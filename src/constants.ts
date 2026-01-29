export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
export const YETI_TYPE = `${PACKAGE_ID}::showflake::Yeti`;
export const REGISTRY_ID = process.env.NEXT_PUBLIC_REGISTRY_ID!;

export type Identity = "Explorer" | "Builder" | "Staker";

export const AVAILABLE_LEVELS: Record<Identity, number[]> = {
  Explorer: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  Builder: [1, 2, 4, 5, 6, 7, 8, 10], // Missing 3, 9
  Staker: [1, 2, 3, 4, 6, 7, 8, 9, 10], // Missing 5
};
