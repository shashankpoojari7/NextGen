export default function ConnectSkeleton({ count = 10 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl p-4 md:p-6 bg-[#ededed] dark:bg-[#111111] border border-gray-300 dark:border-gray-800 flex flex-col items-center text-center shadow-sm"
      >
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full mb-5 user-skeleton-shimmer"/>
        <div className="h-4 md:h-5 w-24 md:w-32 rounded-md mb-2 user-skeleton-shimmer"/>
        <div className="h-3 md:h-4 w-20 md:w-28 rounded-md user-skeleton-shimmer"/>
      </div>
    ))}
    </>
  );
}
