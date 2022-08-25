import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useInstalledApps } from '../../../shared/state/hooks'
import { pressedKey } from '../../state/actions'

export const useKeyboardEvents = (): void => {
  const dispatch = useDispatch()
  const apps = useInstalledApps()
  const appsLength = apps.length

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (['Enter', 'Space'].includes(event.code)) {
        return
      }

      event.preventDefault()

      dispatch(
        pressedKey({
          virtualKey: event.key.toLowerCase(),
          physicalKey: event.code,
          metaKey: event.metaKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          appsLength,
        }),
      )
    }

    document.addEventListener('keydown', handler)

    return function cleanup() {
      document.removeEventListener('keydown', handler)
    }
  }, [dispatch, appsLength])
}
