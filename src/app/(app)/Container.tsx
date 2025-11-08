import React from 'react'

export function Container({ children }: { children: React.ReactNode}) {
  return (
    <div className="relative flex justify-center text-white min-h-screen">
      <main className="relative flex flex-col max-w-[600px] w-full min-h-screen mr-0 ml-0 lg:mr-0 lg:ml-60 sm:ml-20 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

