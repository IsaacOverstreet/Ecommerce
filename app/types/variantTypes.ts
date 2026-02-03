////Types for fetching Data////////////
export type Variants = {
  id: string;
  name: string;
  isColor: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  values: VariantValue[];
};

export type VariantValue = {
  id: string;
  name: string;
  hexCode?: string;
};
