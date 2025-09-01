// Model for Disk and Block
export interface Block {
  id: number;
  allocated: boolean;
  pointer?: number;
}

export interface Disk {
  blocks: Block[];
  size: number;
}
