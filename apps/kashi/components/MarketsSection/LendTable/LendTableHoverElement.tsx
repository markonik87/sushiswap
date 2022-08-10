import { Typography } from '@sushiswap/ui'
import { getCoreRowModel, getSortedRowModel, Row, SortingState, useReactTable } from '@tanstack/react-table'
import { useRouter } from 'next/router'
import React, { FC, useCallback, useState } from 'react'
import useSWR from 'swr'

import { KashiPair } from '../../../.graphclient'
import { GenericTable, LEND_ASSET_COLUMN_POPOVER, NETWORK_COLUMN, SUPPLY_APR_COLUMN } from '../../Table'

interface LendTableHoverElementProps {
  row: KashiPair
}

const COLUMNS = [NETWORK_COLUMN, LEND_ASSET_COLUMN_POPOVER, SUPPLY_APR_COLUMN]

export const LendTableHoverElement: FC<LendTableHoverElementProps> = ({ row }) => {
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([{ id: 'supplyAPR', desc: true }])

  const { data: pairs } = useSWR<KashiPair[]>(
    `/kashi/api/pairs?symbol=${(row.asset.symbol as string).toLowerCase()}&asset=true`,
    (url) => fetch(url).then((response) => response.json())
  )

  const table = useReactTable({
    data: pairs ?? [],
    columns: COLUMNS,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
  })

  const onClick = useCallback(
    (row: Row<KashiPair>) => {
      void router.push(`/${row.original.id}`)
    },
    [router]
  )

  return (
    <div className="min-w-[360px] rounded-lg overflow-hidden">
      <Typography variant="xxs" className="uppercase text-slate-500 px-4 pt-2" weight={600}>
        Top Markets
      </Typography>
      <GenericTable<KashiPair> table={table} columns={COLUMNS} onClick={onClick} variant="popover" />
    </div>
  )
}
