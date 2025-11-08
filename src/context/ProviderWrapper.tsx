"use client"

import React from 'react'
import { SessionProvider } from 'next-auth/react'

function ProviderWrapper({ children }: { children: React.ReactNode}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

export default ProviderWrapper
