import { createReducer } from '@reduxjs/toolkit'

import type { AppId } from '../../config/apps'
import { CARROT_URL } from '../../config/CONSTANTS'
import {
  availableUpdate,
  clickedRestorePicker,
  downloadedUpdate,
  downloadingUpdate,
  gotAccentColor,
  gotAppIcons,
  gotDefaultBrowserStatus,
  openedUrl,
  receivedRendererStartupSignal,
  retrievedInstalledApps,
  startedScanning,
} from '../../main/state/actions'
import {
  clickedDonate,
  clickedUpdateBar,
  pressedKey,
  startedPicker,
} from '../../renderers/picker/state/actions'
import {
  clickedTabButton,
  confirmedReset,
  startedPrefs,
} from '../../renderers/prefs/state/actions'
import { gotKeyLayoutMap } from '../../renderers/shared/state/actions'

type PrefsTab = 'about' | 'apps' | 'general'

interface Data {
  version: string
  updateStatus: 'available' | 'downloaded' | 'downloading' | 'no-update'
  isDefaultProtocolClient: boolean
  url: string
  pickerStarted: boolean
  prefsStarted: boolean
  prefsTab: PrefsTab
  keyCodeMap: Record<string, string>
  scanStatus: 'init' | 'scanned' | 'scanning'
  icons: Partial<Record<AppId, string>>
  activeAppIndex: number
  accentColor: string
}

const defaultData: Data = {
  version: '',
  updateStatus: 'no-update',
  isDefaultProtocolClient: true,
  url: '',
  pickerStarted: false,
  prefsStarted: false,
  prefsTab: 'general',
  keyCodeMap: {},
  scanStatus: 'init',
  icons: {},
  activeAppIndex: 0,
  accentColor: 'aabbccff',
}

const data = createReducer<Data>(defaultData, (builder) =>
  builder
    .addCase(receivedRendererStartupSignal, (_, action) => action.payload.data)

    .addCase(confirmedReset, () => defaultData)

    .addCase(startedScanning, (state) => {
      state.scanStatus = 'scanning'
    })

    .addCase(retrievedInstalledApps, (state) => {
      state.scanStatus = 'scanned'
    })

    .addCase(startedPicker, (state) => {
      state.pickerStarted = true
    })

    .addCase(startedPrefs, (state) => {
      state.prefsStarted = true
    })

    .addCase(pressedKey, (state, action) => {
      const { physicalKey, appsLength, shiftKey } = action.payload

      // Down
      if (physicalKey === 'ArrowDown' || (!shiftKey && physicalKey === 'Tab')) {
        state.activeAppIndex =
          state.activeAppIndex === appsLength - 1 ? 0 : state.activeAppIndex + 1
      }
      // Up
      else if (
        physicalKey === 'ArrowUp' ||
        (shiftKey && physicalKey === 'Tab')
      ) {
        state.activeAppIndex =
          state.activeAppIndex === 0 ? appsLength - 1 : state.activeAppIndex - 1
      }
    })

    .addCase(gotDefaultBrowserStatus, (state, action) => {
      state.isDefaultProtocolClient = action.payload
    })

    .addCase(availableUpdate, (state) => {
      state.updateStatus = 'available'
    })

    .addCase(downloadingUpdate, (state) => {
      state.updateStatus = 'downloading'
    })

    .addCase(downloadedUpdate, (state) => {
      state.updateStatus = 'downloaded'
    })

    .addCase(openedUrl, (state, action) => {
      state.url = action.payload
      state.activeAppIndex = 0
    })

    .addCase(clickedRestorePicker, (state) => {
      state.activeAppIndex = 0
    })

    .addCase(clickedDonate, (state) => {
      state.url = CARROT_URL
    })

    .addCase(clickedTabButton, (state, action) => {
      state.prefsTab = action.payload
    })

    .addCase(gotKeyLayoutMap, (state, action) => {
      state.keyCodeMap = action.payload
    })

    .addCase(gotAppIcons, (state, action) => {
      state.icons = action.payload
    })

    .addCase(gotAccentColor, (state, action) => {
      state.accentColor = action.payload
    })

    .addCase(clickedUpdateBar, (state) => {
      state.prefsTab = 'general'
    }),
)

export type { Data, PrefsTab }
export { data, defaultData }
