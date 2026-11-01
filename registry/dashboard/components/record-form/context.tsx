'use client'

import { createContext, useContext, useMemo } from 'react'

import { createT, defaultT, type Messages, type T, type Translate } from './i18n'
import type { DropzoneHook, Uploader } from './upload'

export type RecordFormSettings = {
  locale?: string
  messages?: Messages
  translate?: Translate
  roles?: string[]
  upload?: Uploader
  dropzone?: DropzoneHook
}

export type RecordFormConfig = Omit<RecordFormSettings, 'messages' | 'translate'> & { t: T }

const Config = createContext<RecordFormConfig>({ t: defaultT })

export const useFormConfig = () => useContext(Config)

export function RecordFormProvider({
  children,
  ...settings
}: RecordFormSettings & { children: React.ReactNode }) {
  const parent = useContext(Config)
  const value = useResolvedConfig(settings, parent)
  return <Config value={value}>{children}</Config>
}

export function useResolvedConfig(settings: RecordFormSettings, parent?: RecordFormConfig) {
  const { locale, messages, translate, roles, upload, dropzone } = settings
  return useMemo<RecordFormConfig>(() => {
    const base = parent ?? { t: defaultT }
    return {
      locale: locale ?? base.locale,
      roles: roles ?? base.roles,
      upload: upload ?? base.upload,
      dropzone: dropzone ?? base.dropzone,
      t: messages || translate || locale ? createT({ messages, translate, locale }) : base.t,
    }
  }, [locale, messages, translate, roles, upload, dropzone, parent])
}

export const ConfigProvider = Config
