import { Timeline } from './timeline'

export default function Demo() {
  return (
    <div className="grid min-h-svh place-items-center p-8">
      <Timeline
        className="w-full max-w-sm"
        events={[
          {
            id: '1',
            content: 'Order confirmation email was sent to the customer.',
            time: '1:36 PM',
          },
          {
            id: '2',
            content: 'A $108.99 payment was processed on Visa •••• 3840.',
            time: '1:36 PM',
          },
          { id: '3', content: 'Order was placed from the Online Store.', time: '1:35 PM' },
        ]}
      />
    </div>
  )
}
