import { Result } from '@ethersproject/abi'
import { BigNumber } from 'ethers'
import FuroExport from 'furo/exports/kovan.json'
import { FuroStream } from 'furo/typechain/FuroStream'
import { FuroVesting } from 'furo/typechain/FuroVesting'
import { useCallback } from 'react'
import { useMemo } from 'react'
import { useState } from 'react'
import { useContract, useContractRead, useSigner } from 'wagmi'

export function useFuroStreamContract(): FuroStream | null {

  const [{ data: signer }] = useSigner()
  return useContract<FuroStream>({
    addressOrName: FuroExport[42].kovan.contracts.FuroStream.address,
    contractInterface: FuroExport[42].kovan.contracts.FuroStream.abi,
    signerOrProvider: signer,
  })
}


export function useFuroVestingContract(): FuroVesting | null {

  const [{ data: signer }] = useSigner()
  return useContract<FuroVesting>({
    addressOrName: FuroExport[42].kovan.contracts.FuroVesting.address,
    contractInterface: FuroExport[42].kovan.contracts.FuroVesting.abi,
    signerOrProvider: signer,
  })
}

export function useStreamBalance(streamId: string): BigNumber {
  const [balance, setBalance] = useState<BigNumber>()
  const [{ data, error, loading }] = useContractRead<FuroStream>(
    {
      addressOrName: FuroExport[42].kovan.contracts.FuroStream.address,
      contractInterface: FuroExport[42].kovan.contracts.FuroStream.abi,
    },
    'streamBalanceOf',
    { args: [streamId], watch: true },
  )
  useMemo(() => {
    if (!error && !loading && data !== undefined && streamId) {
      setBalance(BigNumber.from(data.recipientBalance))
    }
  }, [error, loading, data, streamId])

  return balance
}
