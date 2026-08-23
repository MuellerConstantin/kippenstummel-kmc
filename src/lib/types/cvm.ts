/**
 * Where the data a CVM currently holds originates from. This is the origin of
 * the data itself, not the channel it arrived through — imports and
 * synchronisations overwrite it.
 */
export type CvmSource = "osm" | "operator" | "community";

export interface Cvm {
  id: string;
  latitude: number;
  longitude: number;
  score: number;
  recentlyReported: {
    missing: number;
    spam: number;
    inactive: number;
    inaccessible: number;
  };
  alreadyVoted?: "upvote" | "downvote";
  imported: boolean;
  source: CvmSource;
  createdAt: string;
  updatedAt: string;
}

export interface CvmCluster {
  cluster: boolean;
  latitude: number;
  longitude: number;
  count: number;
}
