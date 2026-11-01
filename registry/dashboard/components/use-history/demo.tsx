'use client'

import { Redo2, Undo2 } from 'lucide-react'

import { Button } from '@/registry/dashboard/components/button/button'
import { Field, Input } from '@/registry/dashboard/components/input/input'

import { useHistory } from './use-history'

export default function Demo() {
  const { value, set, undo, redo, canUndo, canRedo, reset } = useHistory(
    { name: 'Jordan Ellis', company: 'Northwind' },
    { hotkeys: true },
  )

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Name" htmlFor="name">
        <Input
          id="name"
          value={value.name}
          onChange={(e) => set({ ...value, name: e.target.value }, { merge: 'name' })}
        />
      </Field>
      <Field label="Company" htmlFor="company">
        <Input
          id="company"
          value={value.company}
          onChange={(e) => set({ ...value, company: e.target.value }, { merge: 'company' })}
        />
      </Field>
      <div className="flex gap-2">
        <Button size="icon" aria-label="Undo" disabled={!canUndo} onClick={undo}>
          <Undo2 />
        </Button>
        <Button size="icon" aria-label="Redo" disabled={!canRedo} onClick={redo}>
          <Redo2 />
        </Button>
        <Button variant="ghost" onClick={() => reset()}>
          Clear history
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Typing into one field is a single undo step. Ctrl+Z works when focus is outside the inputs.
      </p>
    </div>
  )
}
