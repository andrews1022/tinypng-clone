"use client";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Box, Download, DownloadCloud } from "lucide-react";
import { useEffect, useState } from "react";

import { compressFile, getFileSizeString } from "@/lib/utils";

import type { DragEvent } from "react";
import type { Result } from "@/types";

declare global {
  interface Window {
    Dropbox: any;
  }
}

const CompressorV2 = () => {
  return <div>CompressorV2</div>;
};

export { CompressorV2 };
