"use client"

import { useSession } from 'next-auth/react'
import React from 'react'

function ProfileHeader() {
  const { data: session } = useSession()
  console.log(session?.user);
  
  return (
    <div className='w-full h-40 rounded-sm mt-3 border-white'>
      <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg mb-4 border border-gray-800">
        <div>
          <p className="text-lg font-semibold text-white">Welcome back, { session?.user?.fullname } 👋</p>
          <p className="text-sm text-gray-400">Explore new posts and connect today.</p>
        </div>
        <img
          src={session?.user?.image || '/no-profile.jpg'}
          alt={session?.user?.username}
          className="w-12 h-12 rounded-full border border-gray-700"
        />
      </div>
      <div className="border border-gray-700 rounded-lg px-4 py-3 mb-4 bg-black">
        <input
          type="text"
          placeholder="What's on your mind?"
          className="w-full bg-transparent text-gray-200 text-sm focus:outline-none"
        />
      </div>
    </div>
  )
}

export default ProfileHeader
