import { formatUSD } from '@sushiswap/format'
import { Currency, Link, NetworkIcon, Typography } from '@sushiswap/ui'
import { KashiMediumRiskLendingPairV1 } from 'lib/KashiPair'
import React, { FC, useMemo } from 'react'
import useSWR from 'swr'

import { KashiPair } from '../../../.graphclient'

interface BorrowTableHoverElementProps {
  row: KashiMediumRiskLendingPairV1
}

export const BorrowTableHoverElement: FC<BorrowTableHoverElementProps> = ({ row }) => {
  const symbol = row.asset.symbol as string
  const { data } = useSWR<KashiPair[]>(`/kashi/api/borrow/${symbol.toLowerCase()}`, (url) =>
    fetch(url).then((response) => response.json())
  )
  const pairs = useMemo(
    () => (Array.isArray(data) ? data.map((pair) => new KashiMediumRiskLendingPairV1(pair)) : []),
    [data]
  )
  return (
    <div className="p-3 overflow-hidden rounded-md">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6">
          <Currency.Icon currency={row.collateral} width={24} height={24} />
        </div>
        <Typography weight={600} variant="xl">
          Borrow {row.asset.symbol}
        </Typography>
      </div>
      <div className="w-full h-px my-3 bg-slate-200/5" />
      <div className="grid grid-cols-4 gap-2 mb-2">
        <Typography variant="sm" weight={500} className="text-slate-100">
          Network
        </Typography>
        <Typography variant="sm" weight={500} className="text-slate-100">
          Collateral
        </Typography>
        <Typography variant="sm" weight={500} className="text-slate-100">
          Available
        </Typography>
        <Typography variant="sm" weight={500} className="text-right text-slate-100">
          APR
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        {pairs.length
          ? pairs
              .sort((a, b) => {
                if (b.totalAssetUSD === a.totalAssetUSD) return 0
                return b.totalAssetUSD < a.totalAssetUSD ? -1 : 1
              })
              .map((pair) => (
                <Link.Internal passHref={true} key={pair.id} href={`/${pair.id}`}>
                  <a className="grid grid-cols-4 gap-2 cursor-pointer hover:opacity-80">
                    <NetworkIcon chainId={pair.chainId} width={20} height={20} />
                    <Typography variant="sm" weight={400} className="text-slate-300">
                      {pair.collateral.symbol}
                    </Typography>
                    <Typography variant="sm" weight={400} className="text-slate-100">
                      {formatUSD(pair.totalAssetUSD)}
                    </Typography>
                    <Typography variant="sm" weight={400} className="text-right text-slate-100">
                      {pair.borrowAPR.toSignificant(4)}%
                    </Typography>
                  </a>
                </Link.Internal>
              ))
          : Array.from(Array(3)).map((el, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 cursor-pointer hover:opacity-80">
                <div className="w-5 h-5 rounded-full animate-pulse bg-slate-700" />
                <div className="w-full h-4 rounded-full animate-pulse bg-slate-700" />
                <div className="w-full h-4 rounded-full animate-pulse bg-slate-700" />
                <div className="w-full h-4 rounded-full animate-pulse bg-slate-700" />
              </div>
            ))}
      </div>
    </div>
  )
}
