# TinyPNG Clone

A TinyPNG clone built using Next.js v13

const orginalSize = file.size;

// check if any files have error set to true
// if so, don't compress
const error = results.find((result) => result.error);

if (error) {
return;
}

const compressedImageFile = await compressFile(file);

const newSize = compressedImageFile.size;
const reduction = ((orginalSize - newSize) / orginalSize) \* 100;

if (!compressedImageFile) {
return setFailedToCompress(true);
}

setIsCompressing(false);
