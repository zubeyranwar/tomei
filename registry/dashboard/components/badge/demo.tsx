import { Badge } from './badge'

export default function Demo() {
  return (
    <div className="flex max-w-lg flex-wrap justify-center gap-2">
      <Badge indicator="dot">Paid</Badge>
      <Badge tone="warning" indicator="ring">
        Unfulfilled
      </Badge>
      <Badge tone="attention" indicator="ring">
        Payment pending
      </Badge>
      <Badge tone="success" indicator="dot">
        Fulfilled
      </Badge>
      <Badge tone="critical" indicator="dot">
        Refunded
      </Badge>
      <Badge tone="info">Draft</Badge>
      <Badge>Archived</Badge>
    </div>
  )
}
