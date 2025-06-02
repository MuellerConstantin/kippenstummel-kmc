"use client";

import { JobsTable } from "@/components/organisms/jobs/JobsTable";

export default function Jobs() {
  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4 p-4">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Job History
          </h4>
          <JobsTable />
        </div>
      </div>
    </div>
  );
}
