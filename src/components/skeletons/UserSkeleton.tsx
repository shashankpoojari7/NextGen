export default function UserSkeleton({ count = 10 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex w-full h-16 items-center py-4 px-2">
          <div className="flex justify-center items-center w-max px-2">
            <div className="h-12 w-12 rounded-full overflow-hidden">
              <div className="user-skeleton-shimmer w-full h-full rounded-full" />
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-2 flex-1 pl-3">
            <div className="user-skeleton-shimmer h-3.5 w-[85%] mr-8 rounded" />
            <div className="user-skeleton-shimmer h-3.5 w-[75%] rounded" />
          </div>
        </div>
      ))}
    </>
  );
}
