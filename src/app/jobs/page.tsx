"use client";

import { useState } from "react";
import { Switch } from "@/components/atoms/Switch";
import { JobsTable } from "@/components/organisms/jobs/JobsTable";

export default function Jobs() {
  const [distinct, setDistinct] = useState(false);

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4 p-4">
        <div className="flex justify-start">
          <Switch isSelected={distinct} onChange={setDistinct}>
            Distinct
          </Switch>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Job History
          </h4>
          <JobsTable distinct={distinct} />
        </div>
      </div>
    </div>
  );
}
