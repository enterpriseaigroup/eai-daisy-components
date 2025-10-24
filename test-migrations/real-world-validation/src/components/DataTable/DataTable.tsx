/**
 * DataTable - Configurator V2 Component
 *
 * Component DataTable from data-table.tsx
 *
 * @migrated from DAISY v1
 */

'use client'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from '@tanstack/react-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './table'

import { useState } from 'react'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

  /**
   * BUSINESS LOGIC: DataTable
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DataTable logic
   * 2. Calls helper functions: useState, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, .map, .map, flexRender, header.getContext, table.getHeaderGroups, .map, .map, flexRender, cell.getContext, row.getVisibleCells, table.getRowModel, table.getRowModel
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useReactTable() - Function call
   * - getCoreRowModel() - Function call
   * - getFilteredRowModel() - Function call
   * - getPaginationRowModel() - Function call
   * - .map() - Function call
   * - .map() - Function call
   * - flexRender() - Function call
   * - header.getContext() - Function call
   * - table.getHeaderGroups() - Function call
   * - .map() - Function call
   * - .map() - Function call
   * - flexRender() - Function call
   * - cell.getContext() - Function call
   * - row.getVisibleCells() - Function call
   * - table.getRowModel() - Function call
   * - table.getRowModel() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useReactTable: Required functionality
   * - getCoreRowModel: Required functionality
   * - getFilteredRowModel: Required functionality
   * - getPaginationRowModel: Required functionality
   * - .map: Required functionality
   * - .map: Required functionality
   * - flexRender: Required functionality
   * - header.getContext: Required functionality
   * - table.getHeaderGroups: Required functionality
   * - .map: Required functionality
   * - .map: Required functionality
   * - flexRender: Required functionality
   * - cell.getContext: Required functionality
   * - row.getVisibleCells: Required functionality
   * - table.getRowModel: Required functionality
   * - table.getRowModel: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useReactTable, getCoreRowModel to process data
   * Output: Computed value or side effect
   *
   */
export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
    })

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    ))}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    )
}