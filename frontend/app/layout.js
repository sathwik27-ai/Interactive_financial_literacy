import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Interactive Financial Literacy Platform',
  description: 'AI-powered financial education and management platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Script
          src="https://cdn.jotfor.ms/agent/embedjs/019a4962af56777cbe7461fcd76af58ec529/embed.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}

