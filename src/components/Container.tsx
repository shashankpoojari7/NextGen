import React from 'react'

export function Container({ children }: { children: React.ReactNode}) {
  return (
    <div className="relative flex justify-center text-white min-h-screen">
      <main className="flex flex-col max-w-[600px] w-full min-h-screen lg:mr-0 lg:ml-60 xl:ml-60 xl:mr-100 ml-20 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

