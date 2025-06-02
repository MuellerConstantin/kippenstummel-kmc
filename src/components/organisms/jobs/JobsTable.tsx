"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import useApi from "@/hooks/useApi";
import {
  Table,
  Column,
  TableHeader,
  Row,
  Cell,
} from "@/components/atoms/Table";
import { Pagination } from "@/components/molecules/Pagination";
import { Key, Selection, TableBody } from "react-aria-components";

export interface JobsTableProps {
  distinct: boolean;
  onSelect?: (
    jobs: {
      jobId: string;
      queue: string;
      name: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
      status: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result: any;
      failedReason?: string;
      attemptsMade: number;
      timestamp: string;
      finishedOn?: string;
      createdAt: string;
      updatedAt: string;
    }[],
  ) => void;
}

export function JobsTable(props: JobsTableProps) {
  const { onSelect } = props;

  const api = useApi();

  const [selected, setSelected] = useState<"all" | Iterable<Key> | undefined>();
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);

  const { data, isLoading, error } = useSWR<
    {
      content: {
        jobId: string;
        queue: string;
        name: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any;
        status: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: any;
        failedReason?: string;
        attemptsMade: number;
        timestamp: string;
        finishedOn?: string;
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
    `/kmc/jobs?page=${page - 1}&perPage=${perPage}&distinct=${props.distinct}`,
    (url) => api.get(url).then((res) => res.data),
  );

  const handleSelect = useCallback(
    (key: Selection) => {
      setSelected(key);

      if (data?.content) {
        if (typeof key === "string") {
          if (key === "all") {
            onSelect?.(data.content);
            return;
          }

          const job = data?.content.find(
            (job) => `ident-table-${job.queue}-${job.jobId}` === key,
          );

          if (job) {
            onSelect?.([job]);
          }
        } else {
          const idents = data?.content.filter((job) =>
            key.has(`ident-table-${job.queue}-${job.jobId}`),
          );

          onSelect?.(idents);
        }
      }
    },
    [data?.content, onSelect],
  );

  return (
    <div>
      {isLoading ? (
        <div className="flex w-fit flex-col gap-4">
          <Table>
            <TableHeader>
              <Column id="queue" isRowHeader>
                Queue
              </Column>
              <Column id="name">Name</Column>
              <Column id="createdAt">Created At</Column>
              <Column id="status">Status</Column>
            </TableHeader>
            <TableBody
              items={Array.from(Array(10).keys()).map((key) => ({ key }))}
            >
              {(row) => (
                <Row key={row.key} id={`ident-table-${row.key}`}>
                  <Cell>
                    <div className="rounde-md h-3 w-24 animate-pulse bg-slate-200 dark:bg-slate-700" />
                  </Cell>
                  <Cell>
                    <div className="h-3 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                  </Cell>
                  <Cell>
                    <div className="h-3 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                  </Cell>
                  <Cell>
                    <div className="h-3 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
      ) : error ? (
        <div className="flex w-fit flex-col gap-4">
          <Table>
            <TableHeader>
              <Column id="queue" isRowHeader>
                Queue
              </Column>
              <Column id="name">Name</Column>
              <Column id="createdAt">Created At</Column>
              <Column id="status">Status</Column>
            </TableHeader>
            <TableBody
              items={Array.from(Array(10).keys()).map((key) => ({ key }))}
            >
              {(row) => (
                <Row key={row.key} id={`ident-table-${row.key}`}>
                  <Cell>
                    <div className="h-3 w-24 rounded-md bg-red-300 dark:bg-red-800" />
                  </Cell>
                  <Cell>
                    <div className="h-3 w-24 rounded-md bg-red-300 dark:bg-red-800" />
                  </Cell>
                  <Cell>
                    <div className="h-3 w-24 rounded-md bg-red-300 dark:bg-red-800" />
                  </Cell>
                  <Cell>
                    <div className="h-3 w-24 rounded-md bg-red-300 dark:bg-red-800" />
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
      ) : data && data.content.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Table
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={(keys) => handleSelect(keys)}
          >
            <TableHeader>
              <Column id="queue" isRowHeader>
                Queue
              </Column>
              <Column id="name">Name</Column>
              <Column id="createdAt">Created At</Column>
              <Column id="status">Status</Column>
            </TableHeader>
            <TableBody items={data.content}>
              {(row) => (
                <Row
                  key={`${row.queue}-${row.jobId}`}
                  id={`ident-table-${row.queue}-${row.jobId}`}
                >
                  <Cell>{row.queue}</Cell>
                  <Cell>{row.name}</Cell>
                  <Cell>{new Date(row.createdAt).toLocaleString()}</Cell>
                  <Cell>
                    <div
                      className={`w-fit rounded-md px-1 py-0.5 text-xs text-white capitalize ${row.status === "completed" ? "bg-green-600" : row.status === "failed" ? "bg-red-600" : "bg-slate-400"}`}
                    >
                      {row.status}
                    </div>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
          <Pagination
            totalPages={data!.info.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <div className="max-h-[40rem] min-h-[20rem] w-[22rem] max-w-full">
          <div className="text-sm italic">No Idents found</div>
        </div>
      )}
    </div>
  );
}
