'use client'

import { useState } from 'react'

import {
  BarChart3,
  Bell,
  ChevronDown,
  Home,
  Megaphone,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react'

import { Button } from '@/registry/dashboard/components/button/button'
import { DataTable } from '@/registry/dashboard/components/data-table/data-table'
import { Input } from '@/registry/dashboard/components/input/input'
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

export function OrdersDashboard() {
  const [loading, setLoading] = useState(false)

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
              <h1 className="text-xl font-semibold">Orders</h1>
              <div className="flex gap-2">
                <Button>Export</Button>
                <Button>
                  More actions <ChevronDown />
                </Button>
                <Button variant="primary">Create order</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <DataTable
              rows={orders}
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
    </div>
  )
}
