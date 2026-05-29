// Thin wrappers over window.laerioAPI for the L'AERIO panels.

export type BrandRow = {
  id: string;
  name: string;
  niche_group?: string | null;
  sub_niche?: string | null;
  country?: string | null;
  tier?: number | null;
  fit_score?: number | null;
  status?: string | null;
};

export type FindHit = {
  brand_id: string;
  name: string;
  tier?: number | null;
  fit_score?: number | null;
  niche_group?: string | null;
  country?: string | null;
  distance: number;
};

interface LaerioAPI {
  health: () => Promise<{
    counts: Record<string, number>;
    db_exists: boolean;
    db_path?: string;
  }>;
  brandsSearch: (args: {
    q?: string;
    tierMax?: number;
    niche?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ rows: BrandRow[]; count: number }>;
  researchFind: (
    intent: string,
    topK?: number,
  ) => Promise<{ hits: FindHit[]; count: number; intent: string }>;
  researchPitch: (
    brandId: string,
    k?: number,
  ) => Promise<{ brand_id: string; angles: string[]; count: number }>;
}

declare global {
  interface Window {
    laerioAPI: LaerioAPI;
  }
}

export const laerio = (): LaerioAPI => window.laerioAPI;
