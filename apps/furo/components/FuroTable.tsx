import { AddressZero } from '@ethersproject/constants'
import { Chain } from '@sushiswap/chain'
import { Amount, Token, WNATIVE_ADDRESS } from '@sushiswap/currency'
import { shortenAddress } from '@sushiswap/format'
import { type Stream as StreamDTO, type Vesting as VestingDTO, Rebase as RebaseDTO } from '@sushiswap/graph-client'
import { Chip, ProgressBar, ProgressColor, Table, Typography } from '@sushiswap/ui'
import { createTable, FilterFn, getCoreRowModel, getFilteredRowModel, useTableInstance } from '@tanstack/react-table'
import { FuroStatus, Stream, Vesting } from 'lib'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useNetwork } from 'wagmi'

export enum FuroTableType {
  INCOMING,
  OUTGOING,
}

interface FuroTableProps {
  chainId: number | undefined
  balances: Record<string, Amount<Token>> | undefined
  globalFilter: any
  setGlobalFilter: any
  streams: StreamDTO[]
  vestings: VestingDTO[]
  rebases: RebaseDTO[] | undefined
  type: FuroTableType
  placeholder: string
  loading: boolean
}

// @ts-ignore
const showActiveOnly: FilterFn<Stream | Vesting> = (row, columnId) => {
  return row.getValue(columnId) === FuroStatus.ACTIVE
}

const table = createTable()
  .setRowType<Stream | Vesting>()
  .setOptions({
    filterFns: {
      // @ts-ignore
      showActiveOnly: showActiveOnly,
    },
  })

const defaultColumns = (tableProps: FuroTableProps) => [
  table.createDataColumn('streamedPercentage', {
    header: () => <div className="w-full text-left">Streamed</div>,
    cell: (props) => (
      <div className="flex gap-3">
        <ProgressBar
          showLabel={false}
          className="min-w-[100px] max-w-[100px] h-3"
          progress={Number(props.getValue()?.divide(100).toSignificant(4))}
          color={ProgressColor.BLUE}
        />
        <Typography variant="sm" weight={700} className="text-slate-200">
          {props.getValue()?.toSignificant(4)}%
        </Typography>
      </div>
    ),
  }),
  table.createDataColumn('status', {
    header: () => <div className="w-full text-left">Status</div>,
    filterFn: 'showActiveOnly',
    cell: (props) => (
      <Chip
        className="capitalize"
        label={props.getValue() === FuroStatus.EXTENDED ? 'Active' : props.getValue().toLowerCase()}
        color={
          props.getValue() === FuroStatus.CANCELLED
            ? 'red'
            : props.getValue() === FuroStatus.COMPLETED
            ? 'blue'
            : props.getValue() === FuroStatus.ACTIVE
            ? 'green'
            : props.getValue() === FuroStatus.UPCOMING
            ? 'yellow'
            : props.getValue() === FuroStatus.EXTENDED
            ? 'green'
            : 'default'
        }
      />
    ),
  }),
  table.createDataColumn('amount', {
    header: () => <div className="w-full text-right">Amount</div>,
    cell: (props) => {
      return (
        <div className="flex flex-col w-full">
          <Typography variant="sm" weight={700} className="text-right text-slate-200">
            {props.getValue().greaterThan('0') ? props.getValue().toSignificant(6) : '< 0.01'}
          </Typography>
          <Typography variant="xs" weight={500} className="text-right text-slate-500">
            {props.row.original?.token.symbol}
          </Typography>
        </div>
      )
    },
  }),
  table.createDataColumn('type', {
    header: () => <div className="w-full text-left">Type</div>,
    cell: (props) => <div className="w-full text-left">{props.getValue()}</div>,
  }),
  table.createDisplayColumn({
    id: 'from',
    accessorFn: (props) => (tableProps.type === FuroTableType.INCOMING ? props.createdBy.id : props.recipient.id),
    header: () => <div className="w-full text-left">{tableProps.type === FuroTableType.INCOMING ? 'From' : 'To'}</div>,
    cell: (props) =>
      tableProps.chainId ? (
        <Link href={Chain.from(tableProps.chainId).getAccountUrl(props.getValue() as string)} passHref={true}>
          <a
            target="_blank"
            className="w-full text-left text-blue hover:text-blue-200"
            onClick={(e) => e.stopPropagation()}
          >
            {shortenAddress(props.getValue() as string)}
          </a>
        </Link>
      ) : null,
  }),
  table.createDataColumn('startTime', {
    header: () => <div className="w-full text-left">Start Date</div>,
    cell: (props) => (
      <div className="flex flex-col gap-0.5">
        <Typography variant="sm" className="whitespace-nowrap">
          {props.getValue().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          })}
        </Typography>
      </div>
    ),
  }),
]

export const FuroTable: FC<FuroTableProps> = (props) => {
  const { streams, vestings, rebases, placeholder, loading } = props
  const [initialized, setInitialized] = useState(!loading)

  useEffect(() => {
    if (!loading) setInitialized(true)
  }, [loading])

  const router = useRouter()
  const { activeChain } = useNetwork()
  const data = useMemo(() => {
    console.log(streams, vestings, rebases)
    if (!activeChain || !streams || !vestings || !rebases) return []
    return streams
      .map(
        (stream) =>
          new Stream({
            chainId: activeChain.id,
            furo: stream,
            rebase: rebases.find((rebase) =>
              stream.token.id === AddressZero
                ? WNATIVE_ADDRESS[activeChain.id].toLowerCase() === rebase.id
                : rebase.id === stream.token.id
            ) as RebaseDTO,
          })
      )
      .concat(
        vestings?.map(
          (vesting) =>
            new Vesting({
              furo: vesting,
              chainId: activeChain.id,
              rebase: rebases.find((rebase) =>
                vesting.token.id === AddressZero
                  ? WNATIVE_ADDRESS[activeChain.id].toLowerCase() === rebase.id
                  : rebase.id === vesting.token.id
              ) as RebaseDTO,
            })
        )
      )
    //rebase: rebases.find(rebase => rebase.id === vesting.token) as { base: string; elastic: string }
  }, [activeChain, streams, vestings, rebases])

  const [columns] = React.useState<typeof defaultColumns>(() => [
    ...defaultColumns({ ...props, chainId: activeChain?.id }),
  ])

  const instance = useTableInstance(table, {
    data,
    // @ts-ignore
    columns,
    state: {
      globalFilter: props.globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'showActiveOnly',
    onGlobalFilterChange: props.setGlobalFilter,
  })

  // useMemo(() => {
  //   data.forEach((stream) => {
  //     if (stream instanceof Stream && !!props.balances?.[stream.id]) {
  //       stream.balance = props.balances[stream.id]
  //     }
  //   }, [])
  // }, [data, props.balances])

  return (
    <Table.container>
      <Table.table>
        <Table.thead>
          {instance.getHeaderGroups().map((headerGroup) => (
            <Table.thr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.th key={header.id} colSpan={header.colSpan}>
                  {header.renderHeader()}
                </Table.th>
              ))}
            </Table.thr>
          ))}
        </Table.thead>
        <Table.tbody>
          {instance.getRowModel().rows.length === 0 && (
            <Table.tr>
              {!initialized ? (
                <td colSpan={columns.length}>
                  <div className="w-full h-12 animate-pulse bg-slate-800/30" />
                </td>
              ) : (
                <Table.td colSpan={columns.length} className="!text-xs italic text-center text-slate-500">
                  {placeholder}
                </Table.td>
              )}
            </Table.tr>
          )}
          {instance.getRowModel().rows.map((row) => {
            return (
              <Table.tr
                key={row.id}
                onClick={() =>
                  router.push({
                    pathname: `/${row.original?.type.toLowerCase()}/${row.original?.id}`,
                    query: { chainId: activeChain?.id },
                  })
                }
              >
                {row.getVisibleCells().map((cell) => {
                  return <Table.td key={cell.id}>{cell.renderCell()}</Table.td>
                })}
              </Table.tr>
            )
          })}
        </Table.tbody>
      </Table.table>
    </Table.container>
  )
}

export default FuroTable
