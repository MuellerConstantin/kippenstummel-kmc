/**
 * An origin data about a CVM can come from. This is the origin of the data
 * itself, not the channel it arrived through — a file a moderator uploads may
 * well hold an OpenStreetMap extract.
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
  /**
   * Every origin that has contributed data to this CVM. The set only ever
   * grows, so it says what has flowed into the record rather than who wrote it
   * last.
   */
  sources: CvmSource[];
  createdAt: string;
  updatedAt: string;
}

export interface CvmCluster {
  cluster: boolean;
  latitude: number;
  longitude: number;
  count: number;
}
