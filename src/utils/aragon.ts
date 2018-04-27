import { hash } from 'eth-ens-namehash'
import { keccak256 } from 'js-sha3'

export const APP_BASE_NAMESPACE = '0x' + keccak256('base')

export const namehash = (name: string) => {
  return hash(name)
}