import imagemin from "imagemin";
import imageminJpegRecompress from "imagemin-jpeg-recompress";
import imageminPngquant from "imagemin-pngquant";
import pngquant from "pngquant-bin";

import { NextRequest, NextResponse } from "next/server";

type UploadedImage = {
  base64String: string;
  extension: string;
  name: string;
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    console.log("body", body);

    // const { base64String, extension, name } = body;
    // const base64Image = base64String.split(";base64").pop();
    // const filename = `${name}.${extension}`;

    // if (!base64Image) {
    //   return NextResponse.json(
    //     {
    //       message: "No image provided!"
    //     },
    //     {
    //       status: 400
    //     }
    //   );
    // }

    // const result = Buffer.from(base64Image, "base64");

    // // create a new image buffer with the result
    // const newImageBuffer = await imagemin.buffer(result, {
    //   plugins: [
    //     imageminJpegRecompress({
    //       min: 20,
    //       max: 60
    //     }),
    //     imageminPngquant({
    //       quality: [0.2, 0.6]
    //     })
    //   ]
    // });

    // const filesize = newImageBuffer.length;
    // const base64CompString = newImageBuffer.toString("base64");
    // const imageDataObj = { base64CompString, filename, filesize };

    return NextResponse.json(
      {
        // data: imageDataObj,
        message: "Image uploaded successfully!"
      },
      {
        status: 200
      }
    );
  } catch (error) {
    console.log("error", error);

    return NextResponse.json(
      {
        message: "Something went wrong when uploading the images!"
      },
      {
        status: 500
      }
    );
  }
};
