"use client";

import { useEffect, useState } from "react";
import { CircleX, Loader } from "lucide-react";
import axios from "axios";
import { useDebounceValue } from "usehooks-ts";
import { ApiResponse } from "@/lib/ApiResponse";
import { Types } from "mongoose";
import Link from "next/link";
import UserSkeleton from "@/components/skeletons/UserSkeleton";

export interface searchData {
  profile_image: string;
  username: string;
  _id: Types.ObjectId;
}

function SearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedTerm] = useDebounceValue(inputValue, 500);
  const [data, setData] = useState<searchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!debouncedTerm) {
      setData([]);
      return;
    }

    const controller = new AbortController();

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse>(
          `/api/user/search/${debouncedTerm}`,
          { signal: controller.signal }
        );
        setData(response.data.data || []);
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          console.error("Search fetch error:", err);
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      controller.abort();
    };
  }, [debouncedTerm]);

  const handleClear = () => {
    setData([]);
    setInputValue("");
    setError('')
  };

  return (
    <>
      {/* Search Header */}
      <div className="flex w-full px-4 py-4">
        <h2 className="text-3xl font-semibold text-gray-300">Search</h2>
      </div>

      {/* Search Input */}
      <div className="flex border border-gray-700 rounded-lg px-4 py-2 mb-4 bg-black mx-3 items-center">
        <input
          type="text"
          autoFocus
          value={inputValue}
          placeholder="Search..."
          className="w-full bg-transparent text-gray-200 text-sm focus:outline-none"
          onChange={(e) => setInputValue(e.target.value)}
        />

        {loading ? (
          <Loader className="animate-spin text-gray-600 w-5" />
        ) : (
          inputValue && (
            <button onClick={handleClear}>
              <CircleX className="text-gray-600 w-5" />
            </button>
          )
        )}
      </div>

      {/* Search Results */}
      <div className="w-full">
        <div className="flex flex-col space-y-1 w-full overflow-auto">
          {loading ? (
            <UserSkeleton />
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : data.length === 0 && debouncedTerm ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500 text-sm">No users found.</p>
            </div>
          ) : (
            data.map((user: any) => (
              <Link href={`/profile/${user.username}`} key={user._id}>
                <div className="flex w-full h-16 py-8 px-1 sm:px-2 hover:bg-[#6c6b6b28]">
                  {/* Profile */}
                  <div className="flex justify-center items-center w-max h-full px-2">
                    <div className="h-13 w-13 rounded-full overflow-hidden">
                      <img
                        src={user.profile_image || "/no-profile.jpg"}
                        alt={user.username}
                      />
                    </div>
                  </div>

                  {/* Main Info */}
                  <div className="flex flex-col space-y-1 justify-center grow pl-2">
                    <p className="text-[14px] font-bold">{user.username}</p>
                    <p className="text-[12px]">{user.fullname || ""}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default SearchPage;