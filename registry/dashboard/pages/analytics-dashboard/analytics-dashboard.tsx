import {
  BarChart3,
  Bell,
  BookOpen,
  Home,
  Maximize2,
  Megaphone,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from 'lucide-react'

import { Button } from '@/registry/dashboard/components/button/button'
import { Input } from '@/registry/dashboard/components/input/input'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
} from '@/registry/dashboard/components/sidebar/sidebar'
import { Card, Trend } from '@/registry/dashboard/components/card/card'
import { DateRangePicker } from '@/registry/dashboard/components/date-range-picker/date-range-picker'
import { BarChartCard } from '@/registry/dashboard/blocks/bar-chart-card/bar-chart-card'
import { DonutChartCard } from '@/registry/dashboard/blocks/donut-chart-card/donut-chart-card'
import { LineChartCard } from '@/registry/dashboard/blocks/line-chart-card/line-chart-card'

import { devices, locations, netSales, products, totalSales, visitors } from './data'

const currency = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 } as const
const compact = new Intl.NumberFormat('en', { ...currency, notation: 'compact' })
const topProduct = Math.max(...products.map((p) => p.current))

const expand = (
  <Button variant="ghost" size="icon-sm" aria-label="Open report">
    <Maximize2 />
  </Button>
)

export function AnalyticsDashboard() {
  return (
    <div className="flex h-svh overflow-hidden bg-background text-foreground">
      <Sidebar className="max-lg:hidden">
        <SidebarHeader
          logo={<span className="size-8 rounded-lg bg-sidebar-primary-foreground" />}
          title="Tomei"
          subtitle="Store admin"
        />
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem icon={<Home />}>Home</SidebarItem>
            <SidebarItem icon={<ShoppingBag />} count={15}>
              Orders
            </SidebarItem>
            <SidebarItem icon={<Package />}>Products</SidebarItem>
            <SidebarItem icon={<Users />}>Customers</SidebarItem>
            <SidebarItem icon={<BarChart3 />} active>
              Analytics
            </SidebarItem>
          </SidebarGroup>
          <SidebarGroup title="Growth">
            <SidebarItem icon={<Megaphone />}>Marketing</SidebarItem>
            <SidebarItem icon={<Tag />}>Discounts</SidebarItem>
          </SidebarGroup>
          <SidebarGroup title="Sales channels">
            <SidebarItem icon={<Store />}>Online store</SidebarItem>
            <SidebarItem icon={<ShoppingBag />}>Point of sale</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarItem icon={<BookOpen />} href="#" external>
            Documentation
          </SidebarItem>
          <SidebarItem icon={<Settings />}>Settings</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
          <Input
            placeholder="Search"
            leading={<Search />}
            trailing={<kbd className="font-sans text-xs">⌘K</kbd>}
            className="max-w-md"
          />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-xl font-semibold">Analytics</h1>
              <Button>Edit</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <DateRangePicker disableFuture />
              <Button>Compare to previous period</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <LineChartCard
                title="Total sales"
                value="$250,000"
                change={20}
                data={totalSales}
                formatOptions={currency}
                action={expand}
              />
              <BarChartCard
                title="Net sales"
                value="$15,000"
                change={5}
                data={netSales}
                currentLabel="Net sales"
                previousLabel="Comparison"
                formatOptions={currency}
                action={expand}
              />
              <DonutChartCard
                title="Sessions by device type"
                change={8}
                data={devices}
                action={expand}
              />

              <Card title="Sales by location" action={expand}>
                <ul className="flex flex-col gap-1.5">
                  {locations.map((l) => (
                    <li
                      key={l.name}
                      className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm"
                    >
                      <span>{l.name}</span>
                      <span className="flex items-center gap-2 font-medium tabular-nums">
                        {l.value}
                        <Trend value={l.change} className="w-10 justify-end" />
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <LineChartCard
                title="Online store visitors"
                value="84,210"
                change={-3}
                data={visitors}
                action={expand}
              />

              <Card title="Gross sales by product" action={expand}>
                <ul className="flex flex-col gap-3">
                  {products.map((p) => (
                    <li key={p.name} className="flex flex-col gap-1 text-xs">
                      <span>{p.name}</span>
                      <span className="flex items-center gap-2">
                        <span className="flex flex-1 flex-col gap-0.5">
                          <span
                            className="h-2 rounded-full bg-chart-1"
                            style={{ width: `${(p.current / topProduct) * 100}%` }}
                          />
                          <span
                            className="h-2 rounded-full bg-chart-2"
                            style={{ width: `${(p.previous / topProduct) * 100}%` }}
                          />
                        </span>
                        <span className="w-12 text-right font-semibold tabular-nums">
                          {compact.format(p.current)}
                        </span>
                        <Trend value={p.change} className="w-9 justify-end" />
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
