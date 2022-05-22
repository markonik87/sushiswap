import { Token } from '@sushiswap/currency'
import { getAddress } from 'ethers/lib/utils'
import { StepConfig } from 'features/vesting/CreateForm/types'
import { FundSource } from 'hooks/useFundSourceToggler'
import * as yup from 'yup'
import Reference from 'yup/lib/Reference'
import { Maybe, Message } from 'yup/lib/types'

export const stepConfigurations: StepConfig[] = [
  { label: 'Weekly', time: 604800 },
  { label: 'Bi-weekly', time: 2 * 604800 },
  { label: 'Monthly', time: 2620800 },
  { label: 'Quarterly', time: 3 * 2620800 },
  { label: 'Yearly', time: 31449600 },
]

yup.addMethod(
  yup.mixed,
  'token',
  function (
    address: string | Reference<string>,
    msg: Message<{ address: string }> = '${address} is not a valid token address',
  ) {
    return this.test({
      message: msg,
      name: 'token',
      exclusive: true,
      params: { address },
      test(value: Maybe<Token>) {
        if (value?.address.length === 0) return true

        try {
          return !!(value && getAddress(value.address))
        } catch {
          return false
        }
      },
    })
  },
)

yup.addMethod(yup.string, 'isAddress', function (msg: Message<{ address: string }> = 'Invalid address') {
  return this.test({
    message: msg,
    name: 'isAddress',
    exclusive: true,
    test(value: Maybe<string>) {
      if (value?.length === 0) return true

      try {
        return !!(value && getAddress(value))
      } catch {
        return false
      }
    },
  })
})

export const createVestingSchema = yup.object({
  // @ts-ignore
  token: yup.mixed<Token>().token().required('Required field'),
  cliff: yup.boolean().required('Required field'),
  startDate: yup.date().min(new Date(), 'Date is be due already').required('Required field'),
  // @ts-ignore
  recipient: yup.string().isAddress('Invalid recipient address').required('Required field'),
  cliffEndDate: yup.date().when('cliff', {
    is: (value: boolean) => value,
    then: yup
      .date()
      .min(new Date(), 'Date is be due already')
      .when('startDate', (startDate, schema) => {
        if (startDate) {
          const dayAfter = new Date(startDate.getTime() + 1)
          return schema.min(dayAfter, 'Date must be later than start date')
        }
        return schema
      })
      .required('Required field'),
    otherwise: yup.date().nullable(),
  }),
  cliffAmount: yup.number().when('cliff', {
    is: (value: boolean) => value,
    then: yup.number().typeError('Target must be a number').min(0, 'Must be greater than zero'),
    otherwise: yup.number().nullable(),
  }),
  stepPayouts: yup.number().min(0, 'Can not be less than zero').required('Required field'),
  stepAmount: yup
    .number()
    .typeError('Target must be a number')
    .min(0, 'Must be greater than zero')
    .required('Required field'),
  stepConfig: yup.mixed<StepConfig>().required('Required field'),
  fundSource: yup.mixed<FundSource>().required('Required field'),
})
