"use client";

import { useState } from "react";

import { DropArea } from "@/components/drop-area";
import { Results } from "@/components/results";

const Compressor = () => {
  // state
  const [counter, setCounter] = useState(1);

  return (
    <>
      <DropArea />

      <Results />
    </>
  );
};

export { Compressor };
