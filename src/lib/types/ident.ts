export interface Ident {
  identity: string;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt: string;
  credibility: number;
  karma: number;
  trusted: boolean;
  displayName?: string;
}
