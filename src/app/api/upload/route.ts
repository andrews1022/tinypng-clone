import imagemin from "imagemin";
import imageminJpegRecompress from "imagemin-jpeg-recompress";
import imageminPngquant from "imagemin-pngquant";

import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    console.log("body: ", body);
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
