import { Amount, Currency } from '@sushiswap/currency'
import { Button, Dots } from '@sushiswap/ui'
import { FC, memo, useEffect } from 'react'

import { ApprovalState, useERC20ApproveCallback } from '../../hooks'
import { ApprovalButtonRenderProp, ApproveButton } from './types'

type RenderPropPayload = ApprovalButtonRenderProp

export interface TokenApproveButton extends ApproveButton<RenderPropPayload> {
  watch?: boolean
  amount?: Amount<Currency>
  address?: string
}

export const TokenApproveButton: FC<TokenApproveButton> = memo(
  ({ watch = true, amount, address, render, setState, disabled, ...props }) => {
    const [approvalState, onApprove] = useERC20ApproveCallback(watch, amount, address)

    // Set to undefined on unmount
    useEffect(() => {
      return () => {
        if (!setState) return
        setState(undefined)
      }
    }, [])

    useEffect(() => {
      if (!setState) return

      setState(approvalState)
    }, [approvalState, setState])

    if (!amount || [ApprovalState.UNKNOWN, ApprovalState.APPROVED].includes(approvalState)) return null
    if (render) return render({ approvalState, onApprove })

    return (
      <Button
        type="button"
        disabled={disabled || approvalState === ApprovalState.PENDING}
        onClick={onApprove}
        {...props}
      >
        {approvalState === ApprovalState.PENDING ? (
          <Dots>Approving {amount.currency.symbol}</Dots>
        ) : (
          `Approve ${amount.currency.symbol}` // TODO: Add tooltip here!
        )}
      </Button>
    )
  }
)
