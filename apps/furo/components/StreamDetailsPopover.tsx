import { ExternalLinkIcon } from '@heroicons/react/outline'
import { Chain } from '@sushiswap/chain'
import { shortenAddress } from '@sushiswap/format'
import { useInterval } from '@sushiswap/hooks'
import { NotepadIcon, Popover, Typography } from '@sushiswap/ui'
import { format } from 'date-fns'
import { FuroStatus, Stream, Vesting } from 'lib'
import { FC, useState } from 'react'

interface StreamTimerState {
  days: string
  hours: string
  minutes: string
  seconds: string
}

interface Props {
  stream?: Stream | Vesting
}

export const StreamDetailsPopover: FC<Props> = ({ stream }) => {
  const [remaining, setRemaining] = useState<StreamTimerState>()

  useInterval(() => {
    if (!stream?.remainingTime) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

    const { days, hours, minutes, seconds } = stream.remainingTime
    setRemaining({
      days: String(Math.max(days, 0)),
      hours: String(Math.max(hours, 0)),
      minutes: String(Math.max(minutes, 0)),
      seconds: String(Math.max(seconds, 0)),
    })
  }, 1000)

  if (!stream) return null

  return (
    <Popover
      button={
        <div className="flex items-center gap-2 px-5 shadow-md cursor-pointer hover:ring-2 active:bg-slate-500 focus:bg-slate-500 hover:bg-slate-600 ring-slate-600 bg-slate-700 rounded-xl h-11">
          <NotepadIcon width={18} height={18} />
          <Typography variant="sm" weight={700} className="text-slate-200">
            Details
          </Typography>
        </div>
      }
      panel={
        <div className="max-w-[530px] gap-4 z-10 shadow-md overflow-hidden rounded-xl flex flex-col bg-slate-800">
          <div className="flex justify-between gap-4 p-4 bg-slate-700">
            <div className="flex gap-6">
              <div className="flex items-center justify-end gap-2">
                <Typography variant="xs" weight={700}>
                  From:
                </Typography>
                <Typography
                  weight={700}
                  variant="xs"
                  onClick={() => stream && navigator.clipboard.writeText(stream.createdBy.id)}
                  className="hover:text-blue"
                >
                  {stream ? shortenAddress(stream.createdBy.id) : ''}
                </Typography>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Typography variant="xs" weight={700}>
                  To:
                </Typography>
                <Typography
                  weight={700}
                  variant="xs"
                  onClick={() => stream && navigator.clipboard.writeText(stream.recipient.id)}
                  className="hover:text-blue"
                >
                  {stream ? shortenAddress(stream.recipient.id) : ''}
                </Typography>
              </div>
            </div>
            <a
              target="_blank"
              href={Chain.from(stream.amount.currency.chainId).getTxUrl(stream.txHash)}
              rel="noreferrer"
              className="-mt-1 -mr-1 p-1 hover:bg-[rgba(255,255,255,0.12)] rounded-full text-slate-400 hover:text-slate-300"
            >
              <ExternalLinkIcon width={20} height={20} />
            </a>
          </div>
          <div className="flex flex-col px-4">
            {stream?.status !== FuroStatus.CANCELLED ? (
              <>
                <Typography variant="xxs" weight={400} className="tracking-wider uppercase text-slate-500">
                  Time Remaining
                </Typography>
                <Typography weight={700} className="mt-2 text-slate-300">
                  {remaining?.days} <span className="text-sm font-medium text-slate-500">days</span> {remaining?.hours}{' '}
                  <span className="text-sm font-medium text-slate-500">hours</span> {remaining?.minutes}{' '}
                  <span className="text-sm font-medium text-slate-500">min</span> {remaining?.seconds}{' '}
                  <span className="text-sm font-medium text-slate-500">sec</span>
                </Typography>
                <Typography variant="xs" weight={400} className="mt-3 text-slate-400">
                  The stream was started on{' '}
                  <span className="text-slate-200">{format(new Date(stream.startTime), 'dd MMM yyyy hh:maaa')}</span> If
                  the sender does not cancel the stream, the full amount will be disbursed to you on{' '}
                  <span className="text-slate-200">{format(new Date(stream.endTime), 'dd MMM yyyy hh:maaa')}</span>
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="xs" weight={400} className="text-slate-500">
                  Time Remaining
                </Typography>
                <Typography variant="lg" weight={700} className="mt-1 text-slate-200">
                  -
                </Typography>
                <Typography variant="xs" weight={400} className="mt-3">
                  {`The stream was cancelled on ${stream?.modifiedAtTimestamp.toLocaleDateString()} @ ${stream?.modifiedAtTimestamp.toLocaleTimeString()} and was active for 
          ${stream?.activeTime?.days} days ${stream?.activeTime?.hours} hours ${stream?.activeTime?.minutes} minutes. `}
                </Typography>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-3 gap-4 px-4 pb-4">
            <div className="col-span-4 sm:col-span-1 flex flex-col gap-4 p-4 bg-slate-700 rounded-xl">
              <div className="flex flex-col">
                <Typography variant="lg" className="text-slate-200" weight={700}>
                  Total
                </Typography>
                <Typography variant="xs" className="text-slate-400" weight={500}>
                  Value of Stream
                </Typography>
                <Typography variant="h3" className="flex items-center mt-3 text-slate-200 truncate" weight={700}>
                  {stream?.amount.toSignificant(6)}
                </Typography>
                <Typography variant="xs" weight={700} as="span" className="mt-1 text-slate-400">
                  {stream?.withdrawnAmount.currency.symbol}
                </Typography>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-4 p-4 bg-blue/30 rounded-xl">
              <div className="flex flex-col">
                <Typography variant="lg" className="text-blue-200" weight={700}>
                  Streamed
                </Typography>
                <Typography variant="xs" weight={500} className="text-blue-300">
                  {stream?.streamedPercentage?.toSignificant(4)}% of total
                </Typography>
                <Typography variant="h3" className="flex items-center mt-3 text-blue-200 truncate" weight={700}>
                  {stream?.streamedAmount?.toSignificant(6)}
                </Typography>
                <Typography variant="xs" weight={700} as="span" className="mt-1 text-blue-300/80">
                  {stream?.withdrawnAmount.currency.symbol}
                </Typography>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-4 p-4 shadow-md bg-pink/30 rounded-xl">
              <div className="flex flex-col">
                <Typography variant="lg" className="text-pink-200" weight={700}>
                  Withdrawn
                </Typography>
                <Typography variant="xs" weight={500} className="text-pink-300">
                  {stream?.withdrawnPercentage.toSignificant(4)}% of total
                </Typography>
                <Typography variant="h3" className="flex items-center mt-3 text-pink-200 truncate" weight={700}>
                  {stream?.withdrawnAmount.toSignificant(6)}
                </Typography>
                <Typography variant="xs" weight={700} as="span" className="mt-1 text-pink-300/80">
                  {stream?.withdrawnAmount.currency.symbol}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}
