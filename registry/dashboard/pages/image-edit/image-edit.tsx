'use client'

import { useRef, useState } from 'react'
import {
  BarChart3,
  Eye,
  Home,
  ImageIcon,
  Package,
  Redo2,
  Settings,
  ShoppingBag,
  Undo2,
  Users,
  X,
} from 'lucide-react'

import { Button } from '@/registry/dashboard/components/button/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
} from '@/registry/dashboard/components/sidebar/sidebar'
import { toast, Toaster } from '@/registry/dashboard/components/toast/toast'
import { useHistory } from '@/registry/dashboard/components/use-history/use-history'
import { cn } from '@/lib/utils'

import { defaultEdit, type Edit, type StageImage } from './edits'
import { Panel, type Tab } from './panel'
import { Stage } from './stage'

type Doc = { images: StageImage[]; edits: Record<string, Edit> }

const initial: Doc = {
  images: [
    { id: 'front', name: 'Front', background: '#ece4d8', fill: '#c2410c' },
    { id: 'back', name: 'Back', background: '#dfe5e2', fill: '#3f6212' },
    { id: 'detail', name: 'Detail', background: '#e7e0ef', fill: '#44403c', scale: 2.2 },
  ],
  edits: {
    back: { ...defaultEdit, filter: 'warm', adjust: { ...defaultEdit.adjust, contrast: 12 } },
  },
}

export function ImageEdit() {
  const history = useHistory(initial, { hotkeys: true })
  const doc = history.value
  const [saved, setSaved] = useState(initial)
  const [active, setActive] = useState(0)
  const [tab, setTab] = useState<Tab>('adjust')
  const [comparing, setComparing] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const gesture = useRef(0)

  const index = Math.min(active, Math.max(0, doc.images.length - 1))
  const image = doc.images[index]
  const edit = (image && doc.edits[image.id]) ?? defaultEdit
  const dirty = JSON.stringify(doc) !== JSON.stringify(saved)

  const setEdit = (next: Edit, merge?: string) => {
    if (!image) return
    history.set(
      (d) => ({ ...d, edits: { ...d.edits, [image.id]: next } }),
      merge ? { merge: `${image.id}-${merge}-${gesture.current}` } : undefined,
    )
  }

  const setImages = (images: StageImage[]) => {
    history.set((d) => ({
      images,
      edits: Object.fromEntries(
        Object.entries(d.edits).filter(([id]) => images.some((i) => i.id === id)),
      ),
    }))
  }

  const cancel = () => {
    history.reset(saved)
    setActive(0)
  }

  const save = () => {
    setSaved(doc)
    history.reset(doc)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
    toast.success('Images saved', {
      description: `${doc.images.length} image${doc.images.length === 1 ? '' : 's'} updated.`,
    })
  }

  return (
    <div className="flex h-svh overflow-hidden bg-sidebar text-foreground">
      <Sidebar className="border-r-0 max-lg:hidden">
        <SidebarHeader
          logo={<span className="size-8 rounded-lg bg-sidebar-primary-foreground" />}
          title="Tomei"
          subtitle="Store admin"
        />
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem icon={<Home />}>Home</SidebarItem>
            <SidebarItem icon={<ShoppingBag />} count={4}>
              Orders
            </SidebarItem>
            <SidebarItem
              icon={<Package />}
              active
              submenu={
                <>
                  <SidebarItem>Collections</SidebarItem>
                  <SidebarItem>Inventory</SidebarItem>
                  <SidebarItem active>Media</SidebarItem>
                  <SidebarItem>Gift cards</SidebarItem>
                </>
              }
            >
              Products
            </SidebarItem>
            <SidebarItem icon={<Users />}>Customers</SidebarItem>
            <SidebarItem icon={<BarChart3 />}>Analytics</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarItem icon={<Settings />}>Settings</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <main className="min-w-0 flex-1 overflow-y-auto bg-card lg:my-2 lg:mr-2 lg:rounded-2xl lg:border">
        <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-card/90 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">Wool Overshirt</span>
            {image && (
              <span className="truncate text-muted-foreground max-sm:hidden">/ {image.name}</span>
            )}
            {dirty && (
              <span className="text-amber-600 max-md:hidden dark:text-amber-400">
                · Unsaved changes
              </span>
            )}
          </div>

          <div
            role="toolbar"
            aria-label="Edit actions"
            className="flex items-center gap-1 rounded-xl bg-primary p-1 text-primary-foreground shadow-lg"
          >
            <button
              type="button"
              disabled={!dirty}
              onClick={cancel}
              className="h-7 rounded-lg px-3 text-sm font-medium hover:bg-primary-foreground/10 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!dirty}
              onClick={save}
              className={cn(
                'h-7 rounded-lg bg-primary-foreground px-3 text-sm font-medium text-primary disabled:opacity-50',
                justSaved && 'disabled:opacity-100',
              )}
            >
              {justSaved ? 'Saved ✓' : 'Save'}
            </button>
          </div>

          <div className="flex justify-end gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              disabled={!history.canUndo}
              onClick={history.undo}
            >
              <Undo2 />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              disabled={!history.canRedo}
              onClick={history.redo}
            >
              <Redo2 />
            </Button>
            <Button
              size="icon"
              aria-label="Hold to compare with original"
              title="Hold to compare"
              aria-pressed={comparing}
              disabled={!image}
              onPointerDown={() => setComparing(true)}
              onPointerUp={() => setComparing(false)}
              onPointerLeave={() => setComparing(false)}
              onKeyDown={(e) => e.key === ' ' && setComparing(true)}
              onKeyUp={() => setComparing(false)}
            >
              <Eye />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Close">
              <X />
            </Button>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 pt-6 pb-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div
            className="flex items-start justify-center rounded-3xl py-6"
            style={{
              background:
                'radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--chart-5) 10%, transparent), transparent 65%)',
            }}
          >
            <Stage
              images={doc.images}
              edits={doc.edits}
              active={index}
              cropping={tab === 'crop'}
              comparing={comparing}
              onSelect={setActive}
              onImages={setImages}
              onPan={(x, y, start) => {
                if (start) gesture.current++
                else setEdit({ ...edit, crop: { ...edit.crop, x, y } }, 'pan')
              }}
            />
          </div>

          <Panel
            tab={tab}
            image={image}
            edit={edit}
            onTab={setTab}
            onEdit={setEdit}
            onStart={() => gesture.current++}
          />
        </div>
      </main>
      <Toaster />
    </div>
  )
}
