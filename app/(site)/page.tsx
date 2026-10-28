import { Contributors } from '@/components/site/home/contributors'
import { Cta } from '@/components/site/home/cta'
import { Faq } from '@/components/site/home/faq'
import { Hero } from '@/components/site/home/hero'
import { Latest } from '@/components/site/home/latest'
import { Process } from '@/components/site/home/process'
import { Scenarios } from '@/components/site/home/scenarios'
import { Statement } from '@/components/site/home/statement'
import { getItems } from '@/lib/registry'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <Scenarios />
      <Process />
      <Latest />
      <Contributors />
      <Faq />
      <Cta example={getItems()[0]?.name} />
    </>
  )
}
