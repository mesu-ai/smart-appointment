'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppointmentProvider } from "@/context/AppointmentContext";
import { ToastProvider } from "@/context/toast-context";
import { ToastContainer } from "@/components/molecules/ToastContainer";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );

  return (
    <html lang="en">
      <head>
        <title>SmartQueue - Appointment & Queue Manager</title>
        <meta name="description" content="Smart appointment booking and queue management system" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AppointmentProvider>
              {children}
              <ToastContainer />
            </AppointmentProvider>
          </ToastProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
