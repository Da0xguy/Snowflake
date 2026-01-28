import type { Metadata } from 'next'
import { Providers } from './providers'
import '../globals.css'

export const metadata: Metadata = {
  title: 'yeti-stamp',
  description: 'My App is a...',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      </head>
      <body>
        <div id="root">
            <Providers>
                {children}
            </Providers>
            </div>
      </body>
    </html>
  )
}