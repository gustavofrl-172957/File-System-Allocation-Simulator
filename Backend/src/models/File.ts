// Model for File and Directory
export interface File {
  name: string;
  size: number;
  blocks: number[];
  method: 'contiguous' | 'linked' | 'indexed';
  inode?: number;
}

export interface Directory {
  files: File[];
}
