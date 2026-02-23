"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { MapPin, ChevronUp, ChevronDown, Equal, X } from "lucide-react";
import useApi from "@/hooks/useApi";
import { ListBox, ListBoxItem } from "@/components/atoms/ListBox";
import { Pagination } from "@/components/molecules/Pagination";
import {
  SCORING_DELETION_UPPER_LIMIT,
  SCORING_GOOD_LOWER_LIMIT,
  SCORING_NEUTRAL_LOWER_LIMIT,
} from "@/lib/constants";

export interface CvmListProps {
  filter?: string | null;
  onClick?: (cvm?: {
    id: string;
    latitude: number;
    longitude: number;
    score: number;
    imported: boolean;
    recentlyReported: {
      missing: number;
      spam: number;
      inactive: number;
      inaccessible: number;
    };
    createdAt: string;
    updatedAt: string;
  }) => void;
}

export function CvmList(props: CvmListProps) {
  const { onClick } = props;

  const api = useApi();

  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);

  const { data, isLoading, error } = useSWR<
    {
      content: {
        id: string;
        latitude: number;
        longitude: number;
        score: number;
        imported: boolean;
        recentlyReported: {
          missing: number;
          spam: number;
          inactive: number;
          inaccessible: number;
        };
        createdAt: string;
        updatedAt: string;
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
  >(
    `/kmc/cvms?page=${page - 1}&perPage=${perPage}${props.filter ? `&filter=${encodeURIComponent(props.filter)}` : ""}`,
    (url) => api.get(url).then((res) => res.data),
  );

  const handleSelect = useCallback(
    (key: string) => {
      setSelected(key);

      const cvm = data?.content.find(
        (cvm) => `cvm-list-item-${cvm.id}` === key,
      );

      if (cvm) {
        onClick?.(cvm);
      } else {
        onClick?.();
      }
    },
    [data?.content, onClick],
  );

  return (
    <div>
      {isLoading ? (
        <div className="flex w-full flex-col gap-4">
          <ListBox className="max-h-[40rem] min-h-[20rem] w-full max-w-full space-y-1 overflow-y-auto">
            {Array.from(Array(10).keys()).map((key) => (
              <ListBoxItem key={key}>
                <div className="flex gap-2 overflow-hidden">
                  <div className="h-7 w-7 animate-pulse rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="h-3 w-[12rem] animate-pulse truncate rounded-md bg-slate-300 dark:bg-slate-700" />
                    <div className="h-2 w-[8rem] animate-pulse truncate rounded-md bg-slate-300 dark:bg-slate-700" />
                  </div>
                </div>
              </ListBoxItem>
            ))}
          </ListBox>
        </div>
      ) : error ? (
        <div className="flex w-full flex-col gap-4">
          <ListBox className="max-h-[40rem] min-h-[20rem] w-full max-w-full space-y-1 overflow-y-auto">
            {Array.from(Array(10).keys()).map((key) => (
              <ListBoxItem key={key}>
                <div className="flex gap-2 overflow-hidden">
                  <div className="h-7 w-7 rounded-full bg-red-300 dark:bg-red-800" />
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="h-3 w-[12rem] truncate rounded-md bg-red-300 dark:bg-red-800" />
                    <div className="h-2 w-[8rem] truncate rounded-md bg-red-300 dark:bg-red-800" />
                  </div>
                </div>
              </ListBoxItem>
            ))}
          </ListBox>
        </div>
      ) : data && data.content.length > 0 ? (
        <div className="flex w-full flex-col gap-4">
          <ListBox
            className="max-h-[40rem] min-h-[20rem] w-full max-w-full space-y-1 overflow-y-auto"
            selectionMode="single"
            selectedKeys={selected ? [selected] : []}
            onSelectionChange={(keys) =>
              handleSelect([...(keys as Set<string>)][0])
            }
          >
            {data?.content.map((cvm) => (
              <ListBoxItem id={`cvm-list-item-${cvm.id}`} key={cvm.id}>
                <div className="flex cursor-pointer gap-2 overflow-hidden">
                  <div className="relative z-[50] h-fit w-fit">
                    {cvm.score <= SCORING_DELETION_UPPER_LIMIT ? (
                      <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-800">
                        <X className="h-2.5 w-2.5 text-white" />
                      </div>
                    ) : cvm.score < SCORING_NEUTRAL_LOWER_LIMIT ? (
                      <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500">
                        <ChevronDown className="h-2.5 w-2.5 text-white" />
                      </div>
                    ) : cvm.score >= SCORING_GOOD_LOWER_LIMIT ? (
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
                    <div className="truncate text-sm font-semibold text-nowrap">
                      {cvm.id}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div>Score:</div>
                      <div>{cvm.score}</div>
                    </div>
                  </div>
                </div>
              </ListBoxItem>
            ))}
          </ListBox>
          <div className="flex flex-col gap-2">
            <Pagination
              totalPages={data!.info.totalPages}
              currentPage={page}
              onPageChange={setPage}
            />
            <div>
              <div className="text-xs">
                Page {page} of {data!.info.totalPages} - Showing{" "}
                {data!.info.perPage * (page - 1) + 1} to{" "}
                {data!.info.perPage * page} of {data!.info.totalElements} CVMs
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-h-[40rem] min-h-[20rem] w-full max-w-full">
          <div className="text-sm italic">No CVMs found</div>
        </div>
      )}
    </div>
  );
}
