'use client'

import { useMemo, useState } from 'react'

import {
  BarChart3,
  ChevronDown,
  Home,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react'

import { Button } from '@/registry/dashboard/components/button/button'
import { DataTable } from '@/registry/dashboard/components/data-table/data-table'
import {
  addDays,
  DateRangePicker,
  startOfDay,
  type DatePreset,
  type DateRange,
} from '@/registry/dashboard/components/date-range-picker/date-range-picker'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
} from '@/registry/dashboard/components/sidebar/sidebar'
import { StatCard } from '@/registry/dashboard/components/stat-card/stat-card'

import { columns, filters, orders, stats, views } from './orders'

const DAY = 86_400_000

const presets: DatePreset[] = [
  { label: 'All time', range: (t) => ({ start: new Date(2000, 0, 1), end: t }) },
  { label: 'Last 7 days', range: (t) => ({ start: addDays(t, -6), end: t }) },
  { label: 'Last 30 days', range: (t) => ({ start: addDays(t, -29), end: t }) },
  { label: 'Last 90 days', range: (t) => ({ start: addDays(t, -89), end: t }) },
]

export function OrdersDashboard() {
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState<DateRange>(() => presets[2].range(startOfDay(new Date())))
  const [rangeLabel, setRangeLabel] = useState('Last 30 days')

  const inRange = useMemo(() => {
    const today = startOfDay(new Date()).getTime()
    const newest = Math.round((today - range.end.getTime()) / DAY)
    const oldest = Math.round((today - range.start.getTime()) / DAY)
    return orders.filter((o) => o.daysAgo >= newest && o.daysAgo <= oldest)
  }, [range])

  const refresh = () =>
    new Promise<void>((resolve) => {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        resolve()
      }, 900)
    })

  return (
    <div className="flex h-svh overflow-hidden bg-background text-foreground">
      <Sidebar className="max-lg:hidden">
        <SidebarHeader
          logo={<span className="size-8 rounded-lg bg-primary" />}
          title="Tomei"
          subtitle="Store admin"
        />
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem icon={<Home />}>Home</SidebarItem>
            <SidebarItem
              icon={<ShoppingBag />}
              active
              submenu={
                <>
                  <SidebarItem>Drafts</SidebarItem>
                  <SidebarItem>Shipping labels</SidebarItem>
                  <SidebarItem>Abandoned checkouts</SidebarItem>
                </>
              }
            >
              Orders
            </SidebarItem>
            <SidebarItem icon={<Package />}>Products</SidebarItem>
            <SidebarItem icon={<Users />}>Customers</SidebarItem>
            <SidebarItem icon={<BarChart3 />}>Analytics</SidebarItem>
          </SidebarGroup>
          <SidebarGroup title="Growth">
            <SidebarItem icon={<Megaphone />}>Marketing</SidebarItem>
            <SidebarItem icon={<Tag />}>Discounts</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarItem icon={<Settings />}>Settings</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">Orders</h1>
            <div className="flex flex-wrap gap-2">
              <DateRangePicker
                presets={presets}
                defaultValue={range}
                disableFuture
                align="end"
                onChange={(next, preset) => {
                  setRange(next)
                  setRangeLabel(preset ?? 'Custom range')
                }}
              />
              <Button>Export</Button>
              <Button>
                More actions <ChevronDown />
              </Button>
              <Button variant="primary">Create order</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                {...stat}
                {...(i === 0 && { value: inRange.length.toLocaleString(), hint: rangeLabel })}
              />
            ))}
          </div>

          <DataTable
            rows={inRange}
            columns={columns}
            getRowId={(o) => o.id}
            views={views}
            filters={filters}
            searchText={(o) => `${o.id} ${o.customer}`}
            searchPlaceholder="Search orders or customers"
            defaultSort={{ key: 'order', direction: 'desc' }}
            selectable
            pageSize={10}
            onRefresh={refresh}
            loading={loading}
            bulkActions={() => (
              <>
                <Button size="sm">Mark as fulfilled</Button>
                <Button size="sm">Print labels</Button>
              </>
            )}
          />
        </div>
      </main>
    </div>
  )
}
