/* eslint-disable unicorn/prefer-regexp-test */
import { clickedRestorePicker, openedUrl } from '../../../main/state/actions'
import type { Middleware } from '../../../shared/state/model'
import { getKeyLayout } from '../../shared/utils/get-key-layout-map'
import { appsRef } from '../refs'

/**
 * Pass actions between main and renderers
 */
export const pickerMiddleware =
  (): Middleware =>
  ({ dispatch, getState }) =>
  (next) =>
  (action) => {
    const oldState = getState()

    // eslint-disable-next-line node/callback-return -- Move to next middleware
    const result = next(action)

    const latestState = getState()

    const hasActiveAppIndexChanged =
      oldState.data.activeAppIndex !== latestState.data.activeAppIndex

    if (hasActiveAppIndexChanged && appsRef.current) {
      appsRef.current[latestState.data.activeAppIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      appsRef.current[latestState.data.activeAppIndex].focus({
        preventScroll: true,
      })
    }

    const doesActionOpenPicker =
      openedUrl.match(action) || clickedRestorePicker.match(action)

    if (doesActionOpenPicker) {
      if (appsRef.current) {
        appsRef.current[0].scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
        })
        appsRef.current[0].focus({ preventScroll: true })
      }

      getKeyLayout(dispatch)
    }

    return result
  }
