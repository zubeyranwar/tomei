'use client'

import { useState } from 'react'

import { Button } from '@/registry/dashboard/components/button/button'
import { Field, Input } from '@/registry/dashboard/components/input/input'

import { ConfirmDialog, Dialog } from './dialog'

export default function Demo() {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [name, setName] = useState('Bole Holdings')

  return (
    <div className="flex gap-2">
      <Button onClick={() => setOpen(true)}>Rename customer</Button>
      <Button variant="danger" onClick={() => setConfirm(true)}>
        Delete order
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Rename customer"
        description="The new name shows on invoices from now on."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <Field label="Customer name" htmlFor="customer-name">
          <Input
            id="customer-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>
      </Dialog>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        tone="danger"
        title="Delete order #1078?"
        description="The order and its invoice are removed for everyone. This can’t be undone."
        confirmLabel="Delete order"
        onConfirm={() => new Promise((r) => setTimeout(r, 700))}
      />
    </div>
  )
}
