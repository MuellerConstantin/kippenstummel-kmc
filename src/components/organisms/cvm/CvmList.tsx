"use client";

import { useState } from "react";
import useSWR from "swr";
import { MapPin, ChevronUp, ChevronDown, Equal } from "lucide-react";
import useApi from "@/hooks/useApi";
import { ListBox, ListBoxItem } from "@/components/atoms/ListBox";
import { Pagination } from "@/components/molecules/Pagination";

export function CvmList() {
  const api = useApi();

  const [page, setPage] = useState(1);
  const [perPage] = useState(25);

  const { data, isLoading, error } = useSWR<
    {
      content: {
        id: string;
        longitude: number;
        latitude: number;
        score: number;
      }[];
      info: {
        page: number;
        perPage: number;
        totalPages: number;
        totalElements: number;
      };
    },
    unknown,
    string | null
  >(`/kmc/cvms?page=${page - 1}&perPage=${perPage}`, (url) =>
    api.get(url).then((res) => res.data),
  );

  return (
    <div>
      {isLoading ? (
        <div className="flex w-fit flex-col gap-4">
          <div className="max-h-[40rem] min-h-[20rem] w-[20rem] overflow-y-auto">
            <ListBox className="h-full w-full">
              {Array.from(Array(10).keys()).map((key) => (
                <ListBoxItem key={key}>
                  <div className="flex gap-2 overflow-hidden">
                    <div className="h-6 w-6 animate-pulse rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="h-3 w-[12rem] animate-pulse truncate rounded-md bg-slate-300 dark:bg-slate-700" />
                      <div className="h-2 w-[8rem] animate-pulse truncate rounded-md bg-slate-300 dark:bg-slate-700" />
                    </div>
                  </div>
                </ListBoxItem>
              ))}
            </ListBox>
          </div>
        </div>
      ) : error ? (
        <div className="flex w-fit flex-col gap-4">
          <div className="max-h-[40rem] min-h-[20rem] w-[20rem] overflow-y-auto">
            <ListBox className="h-full w-full">
              {Array.from(Array(10).keys()).map((key) => (
                <ListBoxItem key={key}>
                  <div className="flex gap-2 overflow-hidden">
                    <div className="h-6 w-6 rounded-full bg-red-300 dark:bg-red-800" />
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="h-3 w-[12rem] truncate rounded-md bg-red-300 dark:bg-red-800" />
                      <div className="h-2 w-[8rem] truncate rounded-md bg-red-300 dark:bg-red-800" />
                    </div>
                  </div>
                </ListBoxItem>
              ))}
            </ListBox>
          </div>
        </div>
      ) : (
        <div className="flex w-fit flex-col gap-4">
          <div className="max-h-[40rem] min-h-[20rem] w-[20rem] overflow-y-auto">
            <ListBox className="max-w-full space-y-1">
              {data?.content.map((cvm) => (
                <ListBoxItem key={cvm.id}>
                  <div className="flex gap-2 overflow-hidden">
                    <div className="relative z-[50] h-fit w-fit">
                      {cvm.score < -99 ? (
                        <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500">
                          <ChevronDown className="h-2.5 w-2.5 text-white" />
                        </div>
                      ) : cvm.score > 99 ? (
                        <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-green-600">
                          <ChevronUp className="h-2.5 w-2.5 text-white" />
                        </div>
                      ) : (
                        <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-500">
                          <Equal className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                      <MapPin className="h-8 w-8 fill-green-600 text-white" />
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="truncate font-semibold text-nowrap">
                        {cvm.id}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div>Score:</div>
                        <div>{(cvm.score / 100).toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </ListBoxItem>
              ))}
            </ListBox>
          </div>
          <Pagination
            totalPages={data!.info.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
