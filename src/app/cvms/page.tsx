"use client";

import { useState } from "react";
import { CvmList } from "@/components/organisms/cvm/CvmList";
import { CvmMap } from "@/components/organisms/map/CvmMap";

export default function Cvms() {
  const [selectedCvm, setSelectedCvm] = useState<{
    id: string;
    longitude: number;
    latitude: number;
    score: number;
  } | null>(null);

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4 p-4 lg:flex-row">
        <div className="w-full space-y-4 md:w-fit">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Registered CVMs
          </h4>
          <CvmList onClick={(cvm) => setSelectedCvm(cvm)} />
        </div>
        <div className="flex w-full flex-col space-y-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            CVM Map
          </h4>
          <div className="flex h-0 min-h-[20rem] grow flex-col overflow-hidden rounded-md">
            <CvmMap selectedCvm={selectedCvm} />
          </div>
        </div>
      </div>
    </div>
  );
}
