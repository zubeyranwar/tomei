import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center text-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-heading-2">Not found</h1>
        <Link href="/" className="eyebrow text-muted-foreground hover:text-foreground">
          ← Back home
        </Link>
      </div>
    </main>
  )
}
