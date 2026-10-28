import { Download, Plus, Settings2, Trash2 } from 'lucide-react'

import { Button } from './button'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary">
          <Plus /> New report
        </Button>
        <Button>
          <Download /> Export
        </Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">
          <Trash2 /> Delete
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="lg" variant="primary">
          Large
        </Button>
        <Button size="icon" aria-label="Settings">
          <Settings2 />
        </Button>
        <Button variant="primary" loading>
          Saving
        </Button>
      </div>
    </div>
  )
}
