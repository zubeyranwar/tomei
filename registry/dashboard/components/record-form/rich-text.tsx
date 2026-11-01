'use client'

import { useEffect, useRef, useState } from 'react'
import { Bold, Italic, Link2, List, ListOrdered, RemoveFormatting, Underline } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useFormConfig } from './context'
import { plainText } from './schema'

const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'P', 'BR', 'UL', 'OL', 'LI', 'A', 'DIV'])
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT'])
const SAFE_URL = /^(https?:|mailto:)/i

export function sanitizeHtml(html: string) {
  if (typeof window === 'undefined') return ''
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement
  const clean = (node: Element) => {
    for (const child of [...node.children]) {
      if (DROP.has(child.tagName)) {
        child.remove()
        continue
      }
      clean(child)
      if (!ALLOWED.has(child.tagName)) {
        child.replaceWith(...child.childNodes)
        continue
      }
      const href = child.getAttribute('href')
      for (const attr of [...child.attributes]) child.removeAttribute(attr.name)
      if (child.tagName === 'A') {
        if (href && SAFE_URL.test(href.trim())) {
          child.setAttribute('href', href.trim())
          child.setAttribute('target', '_blank')
          child.setAttribute('rel', 'noopener noreferrer')
        } else child.replaceWith(...child.childNodes)
      }
    }
  }
  clean(root)
  return root.innerHTML
}

const tools = [
  { command: 'bold', label: 'bold', icon: <Bold />, keys: 'Ctrl+B' },
  { command: 'italic', label: 'italic', icon: <Italic />, keys: 'Ctrl+I' },
  { command: 'underline', label: 'underline', icon: <Underline />, keys: 'Ctrl+U' },
  { command: 'insertUnorderedList', label: 'bulletList', icon: <List /> },
  { command: 'insertOrderedList', label: 'numberedList', icon: <ListOrdered /> },
]

const prose =
  '[&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-1'

export function RichTextField({
  id,
  value,
  placeholder,
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: string) => void
}) {
  const { t } = useFormConfig()
  const editor = useRef<HTMLDivElement>(null)
  const emitted = useRef<string | null>(null)
  const saved = useRef<Range | null>(null)
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [linking, setLinking] = useState(false)
  const [url, setUrl] = useState('')
  const empty = !plainText(value)

  useEffect(() => {
    const el = editor.current
    if (!el || (value === emitted.current && el.dataset.filled)) return
    el.innerHTML = sanitizeHtml(value)
    el.dataset.filled = '1'
    emitted.current = value
  }, [value, disabled])

  useEffect(() => {
    if (disabled) return
    const update = () => {
      if (!editor.current?.contains(document.getSelection()?.anchorNode ?? null)) return
      setActive(
        Object.fromEntries(
          tools.map((tool) => [tool.command, document.queryCommandState(tool.command)]),
        ),
      )
    }
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [disabled])

  const emit = () => {
    const html = sanitizeHtml(editor.current?.innerHTML ?? '')
    emitted.current = html
    onChange(plainText(html) || /<img/i.test(html) ? html : '')
  }

  const run = (command: string, arg?: string) => {
    editor.current?.focus()
    document.execCommand(command, false, arg)
    emit()
  }

  const startLink = () => {
    const selection = document.getSelection()
    saved.current = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null
    setUrl('https://')
    setLinking(true)
  }

  const applyLink = () => {
    const href = url.trim()
    setLinking(false)
    if (!SAFE_URL.test(href) || !saved.current) return
    editor.current?.focus()
    const selection = document.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(saved.current)
    run('createLink', href)
  }

  if (disabled) {
    return (
      <div
        ref={editor}
        id={id}
        aria-describedby={describedBy}
        className={cn(
          'min-h-8 rounded-lg bg-muted/40 px-2.5 py-1.5 text-sm leading-relaxed',
          prose,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-input bg-card transition-[border-color] focus-within:border-ring',
        invalid && 'border-destructive',
      )}
    >
      <div
        role="toolbar"
        aria-label={t('formatting')}
        className="flex flex-wrap items-center gap-0.5 border-b p-1"
      >
        {tools.map((tool) => (
          <button
            key={tool.command}
            type="button"
            title={tool.keys ? `${t(tool.label)} (${tool.keys})` : t(tool.label)}
            aria-label={t(tool.label)}
            aria-pressed={!!active[tool.command]}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(tool.command)}
            className={cn(
              'flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5',
              active[tool.command] && 'bg-muted text-foreground',
            )}
          >
            {tool.icon}
          </button>
        ))}
        <span aria-hidden className="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          title={t('link')}
          aria-label={t('link')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={startLink}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
        >
          <Link2 />
        </button>
        <button
          type="button"
          title={t('clearFormatting')}
          aria-label={t('clearFormatting')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => run('removeFormat')}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
        >
          <RemoveFormatting />
        </button>
        {linking && (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <input
              autoFocus
              value={url}
              aria-label={t('linkAddress')}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyLink()
                }
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  setLinking(false)
                }
              }}
              className="h-7 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus:border-ring"
            />
            <button
              type="button"
              onClick={applyLink}
              className="h-7 rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground"
            >
              {t('add')}
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        {empty && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-2 left-2.5 text-sm text-muted-foreground"
          >
            {placeholder ?? t('writeSomething')}
          </span>
        )}
        <div
          ref={editor}
          id={id}
          role="textbox"
          aria-multiline
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onPaste={(e) => {
            e.preventDefault()
            document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
          }}
          className={cn('min-h-24 px-2.5 py-2 text-sm leading-relaxed outline-none', prose)}
        />
      </div>
    </div>
  )
}
