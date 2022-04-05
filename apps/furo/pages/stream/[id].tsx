import { FC, useMemo } from 'react'
import Container from 'ui/container/Container'
import ProgressBar, { ProgressColor } from 'ui/progressbar/ProgressBar'
import { getBuiltGraphSDK } from '../../.graphclient'
import Main from '../../components/Main'
import BalanceChart from '../../features/stream/BalanceChart'
import { Stream } from '../../features/stream/context/Stream'
import { RawStream, Transaction } from '../../features/stream/context/types'
import StreamTimer from '../../features/stream/StreamTimer'
import TransactionHistory from '../../features/stream/TransactionHistory'

interface Props {
  stream: RawStream
  transactions: Transaction[]
}

const Streams: FC<Props> = (props) => {
  let { stream: rawStream, transactions } = props
  const stream = useMemo(() => new Stream({ stream: rawStream }), [rawStream])

  return (
    <Main>
      <Container maxWidth="6xl">
        <div className="grid grid-flow-col grid-cols-7 grid-rows-6 gap-6 md:grid-flow-row auto-rows-max md:auto-rows-min">
          <div className="flex flex-col items-center col-span-5 row-span-6 ">
            <BalanceChart stream={stream} />
          </div>

          <div className="col-span-2 col-start-6 row-start-2 border rounded border-dark-800 bg-dark-900">
            <div>Streamed:</div>
            <div>{stream.streamedPercentage.toFixed(2)}%</div>
            <ProgressBar progress={stream.streamedPercentage} color={ProgressColor.BLUE} showLabel={false} />
          </div>
          <div className="col-span-2 col-start-6 row-start-3 border rounded border-dark-800 bg-dark-900">
            <div>Withdrawn:</div>
            <div>{(stream.withdrawnPercentage * 100).toFixed(2)}%</div>
            <ProgressBar progress={stream.withdrawnPercentage} color={ProgressColor.PINK} showLabel={false} />
          </div>
          <div className="col-span-2 col-start-6 row-start-4">
            <StreamTimer stream={stream} />
          </div>
          <div className="col-span-2 col-start-6 row-span-2 row-start-6 border rounded border-dark-800 bg-dark-900">
            WITHDRAW
            <div>TRANSFER</div>
          </div>

          <div className="col-span-1 col-start-2 border rounded border-dark-800 bg-dark-900">Links</div>
          <div className="col-span-1 border rounded border-dark-800 bg-dark-900">Details</div>
          <div className="col-span-1 border rounded border-dark-800 bg-dark-900">History</div>
        </div>
        <TransactionHistory transactions={transactions} />
      </Container>
    </Main>
  )
}

export default Streams

export async function getServerSideProps({ query }) {
  const sdk = await getBuiltGraphSDK()
  const stream = (await sdk.Stream({ id: query.id })).stream
  const transactions = (await sdk.Transactions({ id: query.id })).transactions
  return {
    props: {
      stream,
      transactions,
    },
  }
}
