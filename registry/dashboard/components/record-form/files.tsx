'use client'

import { useEffect, useRef, useState } from 'react'
import { RotateCw, Upload, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { toast } from '@/registry/dashboard/components/toast/toast'

import { useFormConfig } from './context'
import { showSize, type FileItem } from './schema'
import { useNativeDropzone, type DropzoneHook, type Rejection } from './upload'

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export function FileField({
  id,
  value,
  accept,
  multiple = true,
  maxSize,
  maxFiles,
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: FileItem[]
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: FileItem[]) => void
}) {
  const { upload, dropzone, t } = useFormConfig()
  const current = useRef(value)
  const sources = useRef(new Map<string, File>())
  const controllers = useRef(new Map<string, AbortController>())
  const [retryable, setRetryable] = useState<string[]>([])
  const [rejected, setRejected] = useState<string[]>([])

  useEffect(() => {
    current.current = value
  }, [value])

  useEffect(() => {
    const running = controllers.current
    return () => running.forEach((c) => c.abort())
  }, [])

  const commit = (next: FileItem[]) => {
    current.current = next
    onChange(next)
  }
  const patch = (fileId: string, change: Partial<FileItem>) =>
    commit(current.current.map((f) => (f.id === fileId ? { ...f, ...change } : f)))

  const start = (item: FileItem, file: File) => {
    if (!upload) return
    const controller = new AbortController()
    controllers.current.set(item.id, controller)
    let last = 0
    upload(file, {
      signal: controller.signal,
      onProgress: (p) => {
        const progress = Math.max(0, Math.min(99, Math.round(p)))
        if (progress - last < 2) return
        last = progress
        patch(item.id, { progress })
      },
    }).then(
      (result) => {
        controllers.current.delete(item.id)
        sources.current.delete(item.id)
        setRetryable((r) => r.filter((x) => x !== item.id))
        patch(item.id, { status: 'done', progress: 100, url: result.url, error: undefined })
      },
      (error: unknown) => {
        controllers.current.delete(item.id)
        if (error instanceof DOMException && error.name === 'AbortError') return
        setRetryable((r) => (r.includes(item.id) ? r : [...r, item.id]))
        patch(item.id, {
          status: 'error',
          error: error instanceof Error ? error.message : t('uploadError'),
        })
      },
    )
  }

  const add = (files: File[]) => {
    setRejected([])
    const items = files.map((file) => {
      const item: FileItem = {
        id: newId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: upload ? undefined : URL.createObjectURL(file),
        status: upload ? 'uploading' : 'done',
        progress: upload ? 0 : 100,
      }
      sources.current.set(item.id, file)
      return item
    })
    commit(multiple ? [...current.current, ...items] : items)
    items.forEach((item, i) => start(item, files[i]))
  }

  const reject = (rejections: Rejection[]) => {
    const messages = rejections.map((r) =>
      r.reason === 'count'
        ? t('rejectedCount')
        : t(r.reason === 'size' ? 'rejectedSize' : 'rejectedType', { name: r.file.name }),
    )
    const unique = [...new Set(messages)]
    setRejected(unique)
    if (toast.isMounted()) unique.forEach((m) => toast.error(m))
  }

  const retry = (item: FileItem) => {
    const file = sources.current.get(item.id)
    if (!file) return
    patch(item.id, { status: 'uploading', progress: 0, error: undefined })
    start({ ...item, status: 'uploading' }, file)
  }

  const remove = (item: FileItem) => {
    controllers.current.get(item.id)?.abort()
    controllers.current.delete(item.id)
    sources.current.delete(item.id)
    setRetryable((r) => r.filter((x) => x !== item.id))
    commit(current.current.filter((f) => f.id !== item.id))
  }

  const rules = [
    accept &&
      accept
        .split(',')
        .map((a) => {
          const k = a.trim().toLowerCase()
          if (k.endsWith('/*')) return `${k.slice(0, -2).replace(/^./, (c) => c.toUpperCase())}s`
          return (k.includes('/') ? k.split('/')[1] : k.replace(/^\./, '')).toUpperCase()
        })
        .join(', '),
    maxSize && t('upTo', { size: showSize(maxSize) }),
  ]
    .filter(Boolean)
    .join(' · ')

  const full = maxFiles !== undefined && value.length >= maxFiles

  return (
    <div className="flex flex-col gap-2">
      {!disabled && !full && (
        <DropArea
          id={id}
          hook={dropzone ?? useNativeDropzone}
          accept={accept}
          multiple={multiple}
          maxSize={maxSize}
          maxFiles={maxFiles !== undefined ? Math.max(0, maxFiles - value.length) : undefined}
          invalid={invalid}
          describedBy={describedBy}
          rules={rules}
          onFiles={add}
          onReject={reject}
        />
      )}
      {rejected.length > 0 && !toast.isMounted() && (
        <ul className="text-xs text-destructive">
          {rejected.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      {value.length > 0 && (
        <ul className="flex flex-col divide-y rounded-lg border">
          {value.map((file) => {
            const uploading = file.status === 'uploading'
            const failed = file.status === 'error'
            return (
              <li key={file.id} className="flex flex-col gap-1.5 px-2.5 py-2 text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-7 shrink-0 items-center justify-center rounded bg-muted font-mono text-[9px] text-muted-foreground uppercase">
                    {file.name.split('.').pop()?.slice(0, 4)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    {file.url && !uploading ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:underline"
                      >
                        {file.name}
                      </a>
                    ) : (
                      <span className="truncate">{file.name}</span>
                    )}
                    <span
                      aria-live="polite"
                      className={cn(
                        'text-xs',
                        failed ? 'text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {failed
                        ? `${t('uploadError')}${file.error ? ` · ${file.error}` : ''}`
                        : uploading
                          ? t('uploadingPercent', { progress: file.progress ?? 0 })
                          : showSize(file.size)}
                    </span>
                  </span>
                  {failed && retryable.includes(file.id) && !disabled && (
                    <button
                      type="button"
                      onClick={() => retry(file)}
                      className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium hover:bg-muted [&_svg]:size-3"
                    >
                      <RotateCw /> {t('retry')}
                    </button>
                  )}
                  {!disabled && (
                    <button
                      type="button"
                      aria-label={uploading ? t('cancelUpload') : t('remove', { name: file.name })}
                      title={uploading ? t('cancelUpload') : undefined}
                      onClick={() => remove(file)}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
                    >
                      <X />
                    </button>
                  )}
                </div>
                {uploading && (
                  <div
                    role="progressbar"
                    aria-label={file.name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={file.progress ?? 0}
                    className="h-1 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
                      style={{ width: `${file.progress ?? 0}%` }}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {disabled && !value.length && (
        <span className="text-sm text-muted-foreground">{t('noFiles')}</span>
      )}
    </div>
  )
}

function DropArea({
  id,
  hook: useDropzone,
  accept,
  multiple,
  maxSize,
  maxFiles,
  invalid,
  describedBy,
  rules,
  onFiles,
  onReject,
}: {
  id: string
  hook: DropzoneHook
  accept?: string
  multiple: boolean
  maxSize?: number
  maxFiles?: number
  invalid?: boolean
  describedBy?: string
  rules: string
  onFiles: (files: File[]) => void
  onReject: (rejections: Rejection[]) => void
}) {
  const { t } = useFormConfig()
  const zone = useDropzone({ accept, multiple, maxSize, maxFiles, onFiles, onReject })
  return (
    <div
      {...zone.rootProps}
      id={id}
      role="button"
      tabIndex={0}
      aria-describedby={describedBy}
      data-invalid={invalid || undefined}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-3 py-4 text-center text-sm transition-colors outline-none focus-visible:border-ring data-invalid:border-destructive',
        zone.isDragActive ? 'border-ring bg-muted' : 'border-input hover:border-ring',
      )}
    >
      <input {...zone.inputProps} />
      <Upload className="size-4 text-muted-foreground" />
      {zone.isDragActive ? (
        <span className="font-medium">{t('dropNow')}</span>
      ) : (
        <span>
          <span className="font-medium">{t(multiple ? 'chooseFiles' : 'chooseFile')}</span>{' '}
          <span className="text-muted-foreground">{t(multiple ? 'orDropMany' : 'orDropOne')}</span>
        </span>
      )}
      {rules && <span className="text-xs text-muted-foreground">{rules}</span>}
    </div>
  )
}
