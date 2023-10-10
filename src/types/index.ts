export type Result = {
  fileName: string;
  isCompressing: boolean;
  newFile: File;
  newFileSizeString: string;
  originalFile: File;
  originalFileSizeString: string;
  percentSaved: number;
};
