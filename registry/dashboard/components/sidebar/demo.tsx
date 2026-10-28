import {
  BarChart3,
  BookOpen,
  Home,
  Megaphone,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from 'lucide-react'

import { Input } from '@/registry/dashboard/components/input/input'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
} from './sidebar'

export default function Demo() {
  return (
    <div className="fixed inset-0 flex bg-background">
      <Sidebar>
        <SidebarHeader
          logo={<span className="size-8 rounded-lg bg-primary" />}
          title="Tomei"
          subtitle="Store admin"
        />
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem icon={<Home />}>Home</SidebarItem>
            <SidebarItem icon={<ShoppingBag />} count={15}>
              Orders
            </SidebarItem>
            <SidebarItem
              icon={<Package />}
              submenu={
                <>
                  <SidebarItem>Collections</SidebarItem>
                  <SidebarItem>Inventory</SidebarItem>
                </>
              }
            >
              Products
            </SidebarItem>
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
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
          <h1 className="text-base font-medium">Analytics</h1>
          <Input placeholder="Search" leading={<Search />} className="max-w-xs" />
        </header>
        <div className="grid flex-1 place-items-center text-sm text-muted-foreground">
          Your page content
        </div>
      </main>
    </div>
  )
}
