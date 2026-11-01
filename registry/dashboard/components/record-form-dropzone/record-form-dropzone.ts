'use client'

import { useDropzone, type Accept, type FileRejection } from 'react-dropzone'

import type {
  DropzoneHook,
  DropzoneState,
  Rejection,
} from '@/registry/dashboard/components/record-form/upload'

function toAccept(accept?: string): Accept | undefined {
  if (!accept) return undefined
  const result: Accept = {}
  const extensions: string[] = []
  for (const part of accept.split(',').map((a) => a.trim())) {
    if (part.startsWith('.')) extensions.push(part)
    else result[part] = []
  }
  if (extensions.length) result['application/octet-stream'] = extensions
  return result
}

const reasonOf = (r: FileRejection): Rejection['reason'] => {
  const code = r.errors[0]?.code
  return code === 'file-too-large' ? 'size' : code === 'too-many-files' ? 'count' : 'type'
}

export const useReactDropzone: DropzoneHook = (options) => {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: toAccept(options.accept),
    multiple: options.multiple,
    maxSize: options.maxSize,
    maxFiles: options.multiple ? (options.maxFiles ?? 0) : 1,
    disabled: options.disabled,
    onDrop: (accepted, rejections) => {
      if (accepted.length) options.onFiles(accepted)
      if (rejections.length)
        options.onReject(rejections.map((r) => ({ file: r.file, reason: reasonOf(r) })))
    },
  })
  return {
    rootProps: getRootProps() as DropzoneState['rootProps'],
    inputProps: getInputProps(),
    isDragActive,
    open,
  }
}
