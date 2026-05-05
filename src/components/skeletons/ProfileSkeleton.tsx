// ProfileSkeleton.tsx

export function ProfileHeaderSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-row w-full gap-2 sm:gap-6 mt-4 md:mt-6">
        {/* Avatar */}
        <div className="flex justify-center items-start sm:items-center pl-6 px-1 pt-2 sm:pl-4 sm:pt-0 sm:px-7 sm:py-10 shrink-0">
          <div className="user-skeleton-shimmer rounded-full h-[88px] w-[88px] sm:h-32 sm:w-32 lg:h-40 lg:w-40 border-3 border-cyan-700/30" />
        </div>

        {/* Right column */}
        <div className="flex flex-col justify-start items-start w-full space-y-4 sm:py-10 px-3 sm:px-0">
          {/* Username + fullname */}
          <div className="flex flex-col space-y-1 sm:space-y-2 w-full">
            <div className="user-skeleton-shimmer rounded-md h-6 sm:h-7 w-36 sm:w-48" />
            <div className="user-skeleton-shimmer rounded-md h-3.5 sm:h-4 w-24 sm:w-32 mt-0.5" />
          </div>

          {/* Stats row */}
          <div className="flex space-x-6 sm:space-x-10 justify-start w-full">
            {[56, 72, 80].map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="user-skeleton-shimmer rounded-md h-5 sm:h-6"
                  style={{ width: w * 0.7, minWidth: 28 }}
                />
                <div
                  className="user-skeleton-shimmer rounded-md h-3 sm:h-3.5"
                  style={{ width: w * 0.9, minWidth: 36 }}
                />
              </div>
            ))}
          </div>

          {/* Bio */}
          <div className="flex flex-col space-y-1.5 w-full">
            <div className="user-skeleton-shimmer rounded-md h-3 sm:h-3.5 w-full" />
            <div className="user-skeleton-shimmer rounded-md h-3 sm:h-3.5 w-5/6" />
            <div className="user-skeleton-shimmer rounded-md h-3 sm:h-3.5 w-2/3 sm:hidden" />
          </div>
        </div>
      </div>

      {/* Follow buttons — matches real: flex space-x-4 w-full px-3 mt-4 sm:mt-6 */}
      <div className="flex space-x-4 w-full px-3 mt-4 sm:mt-6">
        <div className="user-skeleton-shimmer rounded-xl h-9 flex-1" />
        <div className="user-skeleton-shimmer rounded-xl h-9 w-24 sm:w-28" />
      </div>
    </div>
  );
}

// Grid cells only — NO wrapper div, NO heading.
// Callers must wrap this in `<div className="mx-2 mt-5 md:mt-10">` and render
// the Camera + "Posts" heading above it, exactly like the real loaded layout.
export function ProfilePostsSkeleton() {
  const CELL_COUNT = 9;
  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1 rounded-sm overflow-hidden">
      {Array.from({ length: CELL_COUNT }).map((_, i) => (
        <div
          key={i}
          className="user-skeleton-shimmer w-full"
          style={{ aspectRatio: "3 / 4" }}
        />
      ))}
    </div>
  );
}