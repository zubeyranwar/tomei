import { notFound } from 'next/navigation'

import { ThemedPreview } from '@/components/site/docs/themed-preview'
import { InstallCommand } from '@/components/site/install-command'
import { getItem } from '@/lib/registry'
import { registryUrl, site } from '@/lib/site'

const find = (name: string) => getItem(name) ?? notFound()

export function Preview({ name }: { name: string }) {
  return <ThemedPreview name={name} title={find(name).title} />
}

export function Install({ name }: { name: string }) {
  find(name)
  return <InstallCommand url={registryUrl(name)} namespaced={`${site.namespace}/${name}`} />
}
