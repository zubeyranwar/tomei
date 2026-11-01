'use client'

import { Button } from '@/registry/dashboard/components/button/button'

import { Popover } from './popover'

const options = ['Newest first', 'Oldest first', 'Highest total', 'Lowest total']

export default function Demo() {
  return (
    <Popover
      trigger={({ open, toggle }) => (
        <Button aria-expanded={open} onClick={toggle}>
          Sort orders
        </Button>
      )}
    >
      {(close) => (
        <ul role="menu">
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                role="menuitem"
                onClick={close}
                className="flex h-8 w-full items-center rounded-lg px-2 text-left text-sm hover:bg-muted"
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  )
}
