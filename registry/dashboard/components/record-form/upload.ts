'use client'

import { useRef, useState } from 'react'

export type UploadContext = {
  onProgress: (percent: number) => void
  signal: AbortSignal
}

export type UploadResult = { url: string; id?: string }

export type Uploader = (file: File, context: UploadContext) => Promise<UploadResult>

export type Rejection = { file: File; reason: 'size' | 'type' | 'count' }

export type DropzoneOptions = {
  accept?: string
  multiple: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  onFiles: (files: File[]) => void
  onReject: (rejections: Rejection[]) => void
}

export type DropzoneState = {
  rootProps: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }
  inputProps: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }
  isDragActive: boolean
  open: () => void
}

export type DropzoneHook = (options: DropzoneOptions) => DropzoneState

function matches(accept: string | undefined, file: File) {
  if (!accept) return true
  return accept
    .split(',')
    .map((a) => a.trim().toLowerCase())
    .some((a) =>
      a.startsWith('.')
        ? file.name.toLowerCase().endsWith(a)
        : a.endsWith('/*')
          ? file.type.startsWith(a.slice(0, -1))
          : file.type === a,
    )
}

export function sortFiles(files: File[], options: Omit<DropzoneOptions, 'onFiles' | 'onReject'>) {
  const accepted: File[] = []
  const rejected: Rejection[] = []
  for (const file of files) {
    if (!matches(options.accept, file)) rejected.push({ file, reason: 'type' })
    else if (options.maxSize !== undefined && file.size > options.maxSize)
      rejected.push({ file, reason: 'size' })
    else accepted.push(file)
  }
  const limit = options.multiple ? (options.maxFiles ?? Infinity) : 1
  for (const file of accepted.splice(limit)) rejected.push({ file, reason: 'count' })
  return { accepted, rejected }
}

export const useNativeDropzone: DropzoneHook = (options) => {
  const input = useRef<HTMLInputElement>(null)
  const [isDragActive, setDragActive] = useState(false)
  const take = (list: FileList | null) => {
    const { accepted, rejected } = sortFiles([...(list ?? [])], options)
    if (accepted.length) options.onFiles(accepted)
    if (rejected.length) options.onReject(rejected)
  }
  return {
    isDragActive,
    open: () => input.current?.click(),
    rootProps: {
      onClick: () => !options.disabled && input.current?.click(),
      onKeyDown: (e) => {
        if (options.disabled || (e.key !== 'Enter' && e.key !== ' ')) return
        e.preventDefault()
        input.current?.click()
      },
      onDragOver: (e) => {
        e.preventDefault()
        if (!options.disabled) setDragActive(true)
      },
      onDragLeave: () => setDragActive(false),
      onDrop: (e) => {
        e.preventDefault()
        setDragActive(false)
        if (!options.disabled) take(e.dataTransfer.files)
      },
    },
    inputProps: {
      ref: input,
      type: 'file',
      hidden: true,
      accept: options.accept,
      multiple: options.multiple,
      onChange: (e) => {
        take(e.target.files)
        e.target.value = ''
      },
    },
  }
}

export function xhrUploader({
  url,
  field = 'file',
  headers,
  method = 'POST',
  parse = (body) => body as UploadResult,
}: {
  url: string
  field?: string
  headers?: Record<string, string>
  method?: 'POST' | 'PUT'
  parse?: (body: unknown) => UploadResult
}): Uploader {
  return (file, { onProgress, signal }) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url)
      for (const [k, v] of Object.entries(headers ?? {})) xhr.setRequestHeader(k, v)
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100)
      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300)
          return reject(new Error(`Upload failed (${xhr.status})`))
        try {
          resolve(parse(xhr.responseText ? JSON.parse(xhr.responseText) : {}))
        } catch (error) {
          reject(error)
        }
      }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))
      signal.addEventListener('abort', () => xhr.abort())
      const body = new FormData()
      body.append(field, file)
      xhr.send(method === 'PUT' ? file : body)
    })
}
