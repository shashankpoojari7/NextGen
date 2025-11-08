"use client"

import { useState } from 'react'
import { Input } from '../ui/input'

const users = [
  {
    id: 1,
    name: "Shashank Poojari",
    message: "Hi, how are you?",
    profilePic: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Aarav Mehta",
    message: "Let's catch up tomorrow!",
    profilePic: "https://randomuser.me/api/portraits/men/52.jpg"
  },
  {
    id: 3,
    name: "Priya Sharma",
    message: "Check your inbox 💬",
    profilePic: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 4,
    name: "Rahul Singh",
    message: "Meeting at 4 PM?",
    profilePic: "https://randomuser.me/api/portraits/men/18.jpg"
  },
  {
    id: 5,
    name: "Neha Patel",
    message: "Got the photos!",
    profilePic: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    id: 6,
    name: "Vikram Rao",
    message: "Let's go for a drive 🚗",
    profilePic: "https://randomuser.me/api/portraits/men/26.jpg"
  },
  {
    id: 7,
    name: "Isha Verma",
    message: "Loved your recent post 💖",
    profilePic: "https://randomuser.me/api/portraits/women/60.jpg"
  },
  {
    id: 8,
    name: "Rohan Gupta",
    message: "Call me when free.",
    profilePic: "https://randomuser.me/api/portraits/men/70.jpg"
  },
  {
    id: 9,
    name: "Sneha Das",
    message: "That was hilarious 😂",
    profilePic: "https://randomuser.me/api/portraits/women/35.jpg"
  },
  {
    id: 10,
    name: "Arjun Nair",
    message: "Be right back!",
    profilePic: "https://randomuser.me/api/portraits/men/55.jpg"
  },
  {
    id: 11,
    name: "Simran Kaur",
    message: "I’ll text you the details.",
    profilePic: "https://randomuser.me/api/portraits/women/24.jpg"
  },
  {
    id: 12,
    name: "Karan Malhotra",
    message: "Did you see the trailer?",
    profilePic: "https://randomuser.me/api/portraits/men/40.jpg"
  },
  {
    id: 13,
    name: "Ananya Joshi",
    message: "See you at the event 🎉",
    profilePic: "https://randomuser.me/api/portraits/women/52.jpg"
  },
  {
    id: 14,
    name: "Ravi Kumar",
    message: "Project files updated!",
    profilePic: "https://randomuser.me/api/portraits/men/47.jpg"
  },
  {
    id: 15,
    name: "Tanya Desai",
    message: "Can we reschedule?",
    profilePic: "https://randomuser.me/api/portraits/women/55.jpg"
  }
];


function MessageBar() {
  const [search, setSearch] = useState("");
  return (
    <div
      className="fixed z-50 right-0 top-0 h-screen w-20 px-3 py-2 bg-[#151515] border-l xl:w-100 xl:block hidden text-black dark:text-white"
      style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.3)"}}
    >
      {/* messages heading */}
      <div className='flex w-full px-1 py-2'>
        <div className='w-ful'>
          <h2 className='text-[25px] font-semibold'>Chats</h2>
        </div>
      </div>

      {/* search bar */}
      <div className='flex w-full py-2'>
        <Input
          placeholder="Search..."
          className="w-full bg-transparent border border-gray-500/40 text-gray-200 placeholder-gray-50/60 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#97bfb4] focus:border-[#97bfb4] transition-all duration-200"
        />
      </div>

      {/* chats div */}
      <div className="flex flex-col space-y-1 w-full h-[85vh] overflow-auto">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex w-full h-18 py-3 hover:bg-[#6c6b6b28]"
          >
            {/* chat profile */}
            <div className="flex justify-center items-center w-max h-full px-2">
              <div className="h-13 w-13 rounded-full overflow-hidden">
                <img src={user.profilePic} alt={user.name} />
              </div>
            </div>

            {/* chat main */}
            <div className="flex flex-col space-y-1 justify-center grow pl-2">
              <p className="text-[15px] font-bold">{user.name}</p>
              <p className="text-[12px]">{user.message}</p>
            </div>

            {/* chat notification */}
            <div className="flex w-max justify-center items-center px-4">
              <div className="flex justify-center items-center w-2.5 h-2.5 rounded-full bg-[#30d2af]"></div>
            </div>
          </div>
        ))}
      </div>


    </div>
  )
}

export default MessageBar
