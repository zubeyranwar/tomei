'use client'

import { Button } from '@/registry/dashboard/components/button/button'

import { toast, Toaster } from './toast'

const wait = (ms: number, fail = false) =>
  new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject() : resolve()), ms))

export default function Demo() {
  return (
    <div className="flex max-w-xl flex-wrap justify-center gap-2">
      <Button
        onClick={() => toast.success('Order saved', { description: 'Order #1078 was updated.' })}
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toast.error('Couldn’t send the invoice', {
            description: 'The customer’s email address bounced.',
            action: { label: 'Retry', onClick: () => toast.info('Sending again…') },
          })
        }
      >
        Error
      </Button>
      <Button onClick={() => toast.warning('Budget is 92% used')}>Warning</Button>
      <Button
        onClick={() =>
          toast('Row 3 deleted', {
            action: { label: 'Undo', onClick: () => toast.success('Row restored') },
          })
        }
      >
        With undo
      </Button>
      <Button
        variant="primary"
        onClick={() =>
          toast.promise(wait(1500), {
            loading: 'Saving changes…',
            success: 'All changes saved',
            error: 'Save failed',
          })
        }
      >
        Save (promise)
      </Button>
      <Toaster />
    </div>
  )
}
