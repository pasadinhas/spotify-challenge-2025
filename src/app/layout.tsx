import type { Metadata } from 'next'
import './index.css'

export const metadata: Metadata = {
  title: 'WonderGroup Spotify Challenge 2025',
  description: 'WonderGroup Spotify Challenge 2025',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
