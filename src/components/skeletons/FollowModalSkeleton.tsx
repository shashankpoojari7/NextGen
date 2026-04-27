interface FollowModalSkeletonProps {
  count?: number;
}

export default function FollowModalSkeleton({ count = 5 }: FollowModalSkeletonProps) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 mr-2 sm:mr-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 user-skeleton-shimmer" />
            <div className="flex flex-col space-y-2 flex-1 min-w-0">
              <div className="user-skeleton-shimmer h-3 w-28 sm:w-36 rounded" />
            </div>
          </div>

          {/* Button */}
          <div className="shrink-0">
            <div className="user-skeleton-shimmer w-[90px] sm:w-[110px] h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}