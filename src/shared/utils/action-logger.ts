/* eslint-disable unicorn/prefer-regexp-test */
/* eslint-disable no-console */

import {
  bgBlue,
  bgMagenta,
  bgYellow,
  black,
  bold,
  gray,
  green,
  white,
} from 'picocolors'

import { Channel } from '../state/channels'
import type { FSA } from '../state/model'

const channelColorMap = {
  [Channel.MAIN]: bgYellow,
  [Channel.PREFS]: bgBlue,
  [Channel.PICKER]: bgMagenta,
}

/**
 * Toggle this to turn on full payload logging, otherwise just single line
 * values will be displayed: strings, numbers etc.
 */
const verboseActionLog = false

export function actionLogger(action: FSA): void {
  const channel = action.meta?.channel as Channel
  const [namespace] = action.type.split('/')
  const type = action.type.replace(`${namespace}/`, '')

  const channelLog = bold(channelColorMap[channel](black(channel.padEnd(6))))
  const namespaceLog = bold(green(namespace))
  const typeLog = bold(white(type))

  const simplePayload =
    typeof action.payload === 'object' || typeof action.payload === 'undefined'
      ? ''
      : gray(` ${action.payload}`)

  console.log(`${channelLog} ${namespaceLog}/${typeLog}${simplePayload}`)

  if (
    verboseActionLog &&
    action.payload &&
    typeof action.payload === 'object'
  ) {
    console.groupCollapsed()
    console.log(
      gray(
        JSON.stringify(
          action.payload,
          (_, value) => {
            if (typeof value === 'string' && value.length > 100) {
              return `${value.slice(0, 100)}…`
            }

            return value
          },
          2,
        ),
      ),
    )
    console.groupEnd()
  }
}
