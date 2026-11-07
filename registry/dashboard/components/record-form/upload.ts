export type UploadContext = {
  onProgress: (percent: number) => void
  signal: AbortSignal
}

export type UploadResult = { url: string; id?: string }

export type Uploader = (file: File, context: UploadContext) => Promise<UploadResult>

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
