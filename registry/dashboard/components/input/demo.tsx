import { Mail, Search } from 'lucide-react'

import { Field, Input } from './input'

export default function Demo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Input
        placeholder="Search"
        leading={<Search />}
        trailing={<kbd className="font-sans text-xs">⌘K</kbd>}
      />
      <Field label="Email" htmlFor="email" hint="We'll only use it for receipts." required>
        <Input id="email" type="email" placeholder="you@company.com" leading={<Mail />} />
      </Field>
      <Field label="Store name" htmlFor="store" error="Store name is already taken.">
        <Input id="store" defaultValue="Tomei" aria-invalid />
      </Field>
    </div>
  )
}
