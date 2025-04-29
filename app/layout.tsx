import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from './providers'
import { ThemeProvider } from './providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/Header'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: "File Sharing App",
  description: "Temporary file sharing application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register')

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            {!isAuthPage && <Header />}
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
