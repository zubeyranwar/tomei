import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Globe,
  Home,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Printer,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react'

import { Badge } from '@/registry/dashboard/components/badge/badge'
import { Button } from '@/registry/dashboard/components/button/button'
import { InfoRow, InfoSection } from './info-section'
import { Note } from './note'
import { PageHeader } from './page-header'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
} from '@/registry/dashboard/components/sidebar/sidebar'
import { SummaryList } from './summary-list'
import { LineItems } from './line-items'
import { Timeline } from '@/registry/dashboard/blocks/timeline/timeline'

import { customer, events, items, tags } from './data'

export function OrderDetail() {
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
            <SidebarItem icon={<ShoppingBag />} count={12} active>
              Orders
            </SidebarItem>
            <SidebarItem icon={<Package />}>Products</SidebarItem>
            <SidebarItem icon={<Users />}>Customers</SidebarItem>
            <SidebarItem icon={<BarChart3 />}>Analytics</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarItem icon={<Globe />}>Online store</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <main className="min-w-0 flex-1 overflow-y-auto bg-card lg:my-2 lg:mr-2 lg:rounded-2xl lg:border">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8 p-6">
          <PageHeader
            backHref="#"
            breadcrumb={
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="size-4" /> Orders
              </span>
            }
            tools={
              <>
                <Button size="icon" aria-label="Print">
                  <Printer />
                </Button>
                <Button size="icon" aria-label="Edit">
                  <Pencil />
                </Button>
                <Button size="icon" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
                <Button size="icon" aria-label="Previous order">
                  <ChevronUp />
                </Button>
                <Button size="icon" aria-label="Next order">
                  <ChevronDown />
                </Button>
              </>
            }
            title="Order #1078"
            badges={
              <>
                <Badge indicator="dot">Paid</Badge>
                <Badge tone="warning" indicator="ring">
                  Unfulfilled
                </Badge>
              </>
            }
            subtitle="Oct 29, 2026 at 7:24 PM via Online Store"
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="flex min-w-0 flex-col gap-8">
              <Note label="Note from customer">
                Please delay shipping by two days, I&apos;m away and can&apos;t collect the package.
                Thanks!
              </Note>

              <LineItems
                items={items}
                status={
                  <Badge tone="warning" indicator="ring">
                    Unfulfilled
                  </Badge>
                }
                actions={
                  <>
                    <Button variant="ghost" size="icon" aria-label="More fulfillment actions">
                      <MoreHorizontal />
                    </Button>
                    <Button>Mark as fulfilled</Button>
                    <Button variant="primary">Create shipping label</Button>
                  </>
                }
                meta={
                  <>
                    <span className="flex items-center gap-2">
                      <Truck /> Express
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin /> Main warehouse
                    </span>
                  </>
                }
              />

              <section className="flex flex-col gap-3">
                <h2 className="text-base font-semibold">Payment</h2>
                <SummaryList
                  rows={[
                    { label: 'Subtotal', detail: '4 items', value: '$397.50' },
                    { label: 'Discount', detail: 'WELCOME10', value: '−$30.00' },
                    { label: 'Shipping', detail: 'Express', value: '$4.99' },
                  ]}
                  total={{ label: 'Total', value: '$372.49' }}
                  footer={[
                    { label: 'Store credit', value: '$50.00' },
                    { label: 'Visa •••• 3840', value: '$322.49' },
                  ]}
                />
              </section>
            </div>

            <aside className="flex flex-col">
              <InfoSection>
                <h2 className="text-lg font-semibold">{customer.name}</h2>
                <InfoRow icon={<Mail />}>{customer.email}</InfoRow>
                <InfoRow icon={<ShoppingBag />}>{customer.orders} orders</InfoRow>
              </InfoSection>

              <InfoSection title="Shipping address">
                <address className="text-sm leading-6 not-italic">
                  {customer.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </InfoSection>

              <InfoSection title="Conversion summary">
                <InfoRow icon={<ShoppingBag />}>{customer.orders}th order</InfoRow>
                <InfoRow icon={<Globe />}>Source: direct</InfoRow>
              </InfoSection>

              <InfoSection
                title="Tags"
                action={
                  <Button variant="ghost" size="icon-sm" aria-label="Add tag">
                    <Plus />
                  </Button>
                }
              >
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </InfoSection>

              <InfoSection title="Timeline">
                <Timeline events={events} />
              </InfoSection>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
