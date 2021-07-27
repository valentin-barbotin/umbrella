export interface File {
    size: number;
    path: string;
    name: string | null;
    type: string | null;
    lastModifiedDate: Date | null;
    hash: string | 'sha1' | 'md5' | 'sha256' | null;
}
export interface IKey {
    algo: string;
    key: Buffer;
    iv: Buffer;
}

export interface IData {
    name: string;
    owner: string;
    hash?: string;
    type: string;
    lastModified: Date;
    createdOn?: Date;
    sharingKey?: string;
    shared?: boolean;
    originalSize: number;
    size: number;
    crypted: boolean;
    compressed: boolean;
    key?: IKey;
    pubId: string;
}
