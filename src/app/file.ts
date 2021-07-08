export interface File {
    size: number;
    path: string;
    name: string | null;
    type: string | null;
    lastModifiedDate: Date | null;
    hash: string | "sha1" | "md5" | "sha256" | null;
}