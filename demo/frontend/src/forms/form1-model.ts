/** Applicant values shared by youth application and consent PDF fields. */
import { EMPTY_YMD, type YMD } from './ymd.ts'
export interface Form1Value {
  name: string
  birth: YMD
  address: string
  mobile: string
  email: string
  bankName: string
  accountNo: string
  accountHolder: string
}
export const EMPTY_FORM1: Form1Value = {
  name: '', birth: EMPTY_YMD, address: '', mobile: '', email: '',
  bankName: '', accountNo: '', accountHolder: '',
}
