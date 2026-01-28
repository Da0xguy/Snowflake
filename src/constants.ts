export const PACKAGE_ID = "0x570551cab087f831ec0986dab20c23ae4736eb2e67c3aec2b750e687d6439291";
export const YETI_TYPE = `${PACKAGE_ID}::showflake::Yeti`;
export const REGISTRY_ID = "0x71353946e1f46c009c76080fdcbd4c1213ab188c550d7014a867709abea0f693";

export type Identity = "Explorer" | "Builder" | "Staker";

export const AVAILABLE_LEVELS: Record<Identity, number[]> = {
  Explorer: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  Builder: [1, 2, 4, 5, 6, 7, 8, 10], // Missing 3, 9
  Staker: [1, 2, 3, 4, 6, 7, 8, 9, 10], // Missing 5
};
