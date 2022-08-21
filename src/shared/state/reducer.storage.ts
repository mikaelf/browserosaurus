import { createReducer } from '@reduxjs/toolkit'

import type { AppId } from '../../config/apps'
import { apps } from '../../config/apps'
import {
  changedPickerWindowBounds,
  readiedApp,
  receivedRendererStartupSignal,
  retrievedInstalledApps,
} from '../../main/state/actions'
import {
  clickedDonate,
  clickedMaybeLater,
} from '../../renderers/picker/state/actions'
import {
  confirmedReset,
  reorderedApp,
  updatedHotCode,
} from '../../renderers/prefs/state/actions'
import { getKeys } from '../utils/get-keys'

interface Storage {
  apps: {
    id: AppId
    hotCode: string | null
    isInstalled: boolean
  }[]
  supportMessage: number
  isSetup: boolean
  height: number
}

const defaultStorage: Storage = {
  apps: [],
  supportMessage: 0,
  isSetup: false,
  height: 200,
}

const storage = createReducer<Storage>(defaultStorage, (builder) =>
  builder
    .addCase(readiedApp, (state) => {
      state.isSetup = true

      // Remove apps from storage that B doesn't support
      for (const storedApp of state.apps) {
        if (!apps[storedApp.id]) {
          const storedAppIndex = state.apps.findIndex(
            (app) => app.id === storedApp.id,
          )

          if (storedAppIndex !== -1) {
            state.apps.splice(storedAppIndex, 1)
          }
        }
      }

      // Add apps to storage that B supports
      for (const configAppId of getKeys(apps)) {
        const storedAppsDoesntContainConfigApp = state.apps.every(
          (app) => app.id !== configAppId,
        )

        if (storedAppsDoesntContainConfigApp) {
          state.apps.push({
            id: configAppId,
            hotCode: null,
            isInstalled: false,
          })
        }
      }
    })

    .addCase(confirmedReset, () => defaultStorage)

    .addCase(
      receivedRendererStartupSignal,
      (_, action) => action.payload.storage,
    )

    .addCase(retrievedInstalledApps, (state, action) => {
      const installedAppIds = action.payload

      for (const app of state.apps) {
        if (installedAppIds.includes(app.id)) {
          app.isInstalled = true
        } else {
          app.isInstalled = false
          app.hotCode = null
        }
      }
    })

    .addCase(updatedHotCode, (state, action) => {
      const hotCode = action.payload.value

      const appWithSameHotCodeIndex = state.apps.findIndex(
        (app) => app.hotCode === hotCode,
      )

      if (appWithSameHotCodeIndex > -1) {
        state.apps[appWithSameHotCodeIndex].hotCode = null
      }

      const appIndex = state.apps.findIndex(
        (app) => app.id === action.payload.appId,
      )

      state.apps[appIndex].hotCode = hotCode
    })

    .addCase(clickedDonate, (state) => {
      state.supportMessage = -1
    })

    .addCase(clickedMaybeLater, (state) => {
      state.supportMessage = Date.now()
    })

    .addCase(changedPickerWindowBounds, (state, action) => {
      state.height = action.payload.height
    })

    .addCase(reorderedApp, (state, action) => {
      const sourceIndex = state.apps.findIndex(
        (app) => app.id === action.payload.sourceId,
      )

      const destinationIndex = state.apps.findIndex(
        (app) => app.id === action.payload.destinationId,
      )

      const [removed] = state.apps.splice(sourceIndex, 1)
      state.apps.splice(destinationIndex, 0, removed)
    }),
)

export { defaultStorage, Storage, storage }
