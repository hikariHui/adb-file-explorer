export type FileItem = {
  name: string;
  type: "directory" | "regular file" | "symbolic link";
  size: string;
  time: string;
  link: string;
  basename: string;
  isDirectory: boolean;
  children?: FileItem[];
};
