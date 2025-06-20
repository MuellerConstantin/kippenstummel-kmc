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
import { IdentFilterSection } from "./IdentFilterSection";

export interface IdentTableProps {
  onSelect?: (
    ident: {
      identity: string;
      createdAt?: string;
      updatedAt?: string;
      credibility: {
        rating: number;
        behaviour?: {
          lastInteractionAt?: string;
          averageInteractionInterval: number;
          lastInteractionPosition?: { longitude: number; latitude: number };
          unrealisticMovementCount: number;
          voting: {
            totalCount: number;
            upvoteCount: number;
            downvoteCount: number;
          };
          registration: {
            totalCount: number;
          };
        };
      };
    }[],
  ) => void;
}

export function IdentTable(props: IdentTableProps) {
  const { onSelect } = props;

  const api = useApi();

  const [selected, setSelected] = useState<"all" | Iterable<Key> | undefined>();
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [filter, setFilter] = useState<string | null>(null);

  const { data, isLoading, error } = useSWR<
    {
      content: {
        identity: string;
        createdAt?: string;
        updatedAt?: string;
        credibility: {
          rating: number;
          behaviour?: {
            lastInteractionAt?: string;
            averageInteractionInterval: number;
            lastInteractionPosition?: { longitude: number; latitude: number };
            unrealisticMovementCount: number;
            voting: {
              totalCount: number;
              upvoteCount: number;
              downvoteCount: number;
            };
            registration: {
              totalCount: number;
            };
          };
        };
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
    `/kmc/ident?page=${page - 1}&perPage=${perPage}${filter ? `&filter=${filter}` : ""}`,
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

          const ident = data?.content.find(
            (ident) => `ident-table-${ident.identity}` === key,
          );

          if (ident) {
            onSelect?.([ident]);
          }
        } else {
          const idents = data?.content.filter((ident) =>
            key.has(`ident-table-${ident.identity}`),
          );

          onSelect?.(idents);
        }
      }
    },
    [data?.content, onSelect],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-screen-sm">
        <IdentFilterSection
          isDisabled={isLoading}
          onFilter={(query) => setFilter(query)}
        />
      </div>
      {isLoading ? (
        <div className="flex w-fit flex-col gap-4">
          <Table>
            <TableHeader>
              <Column id="name" isRowHeader>
                Identity
              </Column>
              <Column id="type">Issued At</Column>
              <Column id="date">Credibility</Column>
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
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
      ) : error ? (
        <div className="flex w-fit flex-col gap-4">
          <Table>
            <TableHeader>
              <Column id="name" isRowHeader>
                Identity
              </Column>
              <Column id="type">Issued At</Column>
              <Column id="date">Credibility</Column>
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
              <Column id="name" isRowHeader>
                Identity
              </Column>
              <Column id="type">Issued At</Column>
              <Column id="date">Credibility</Column>
            </TableHeader>
            <TableBody items={data.content}>
              {(row) => (
                <Row key={row.identity} id={`ident-table-${row.identity}`}>
                  <Cell>{row.identity}</Cell>
                  <Cell>{new Date(row.createdAt!).toLocaleDateString()}</Cell>
                  <Cell>{row.credibility.rating}</Cell>
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
