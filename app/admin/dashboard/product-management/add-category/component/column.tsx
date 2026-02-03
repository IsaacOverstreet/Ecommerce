"use client";

import { formatDate } from "@/utils/formatDate";
import { ColumnDef } from "@tanstack/react-table";

export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export const columns: ColumnDef<Category, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: (info) => formatDate(info.getValue() as string),
  },
];
