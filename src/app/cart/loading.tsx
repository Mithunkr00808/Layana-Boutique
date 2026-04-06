import { Loader2 } from "lucide-react";

export default function CartLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      {/* Navbar Placeholder */}
      <div className="fixed top-0 w-full z-50 bg-white/80 border-b border-zinc-100 h-16" />
      
      <main className="flex-grow max-w-[1440px] mx-auto px-10 w-full pt-16 mt-20 min-h-[calc(100vh-400px)]">
        {/* Editorial Header Skeleton */}
        <header className="mb-20">
          <div className="h-12 w-64 bg-zinc-100 rounded-lg mb-4" />
          <div className="h-4 w-96 bg-zinc-50 rounded-lg" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-8">
            <div className="w-full">
              {/* Table Header Placeholder */}
              <div className="grid grid-cols-6 pb-6 border-b border-zinc-100">
                <div className="col-span-3 h-4 w-20 bg-zinc-50 rounded" />
                <div className="h-4 w-12 bg-zinc-50 rounded mx-auto" />
                <div className="h-4 w-20 bg-zinc-50 rounded mx-auto" />
                <div className="h-4 w-16 bg-zinc-50 rounded ml-auto" />
              </div>

              {/* Skeleton Rows */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-6 items-center py-10 border-b border-zinc-50/50">
                  <div className="col-span-3 flex items-center gap-8">
                    <div className="w-24 h-32 rounded-[20px] bg-zinc-100 shrink-0" />
                    <div className="space-y-3 w-full">
                      <div className="h-6 w-3/4 bg-zinc-100 rounded" />
                      <div className="h-4 w-1/4 bg-zinc-50 rounded" />
                      <div className="h-3 w-16 bg-zinc-50 rounded mt-4" />
                    </div>
                  </div>
                  <div className="h-5 w-8 bg-zinc-100 rounded mx-auto" />
                  <div className="h-8 w-24 bg-zinc-100 rounded-full mx-auto" />
                  <div className="h-6 w-20 bg-zinc-100 rounded ml-auto" />
                </div>
              ))}
            </div>
            
            {/* Shipping Notice Skeleton */}
            <div className="mt-12 p-8 bg-zinc-50 rounded-xl flex items-start gap-4">
              <div className="size-6 bg-zinc-200 rounded-full shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-4 w-1/3 bg-zinc-200 rounded" />
                <div className="h-3 w-2/3 bg-zinc-100 rounded" />
              </div>
            </div>
          </div>

          {/* Cart Summary Skeleton */}
          <div className="lg:col-span-4 sticky top-32 h-fit">
            <div className="bg-zinc-50 p-10 rounded-[32px] space-y-8">
              <div className="h-8 w-40 bg-zinc-200 rounded" />
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-zinc-100 rounded" />
                  <div className="h-4 w-24 bg-zinc-100 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-zinc-100 rounded" />
                  <div className="h-4 w-24 bg-zinc-100 rounded" />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-200 flex justify-between items-center">
                <div className="h-6 w-16 bg-zinc-200 rounded" />
                <div className="h-10 w-32 bg-zinc-300 rounded" />
              </div>

              <div className="h-14 w-full bg-zinc-400 rounded-full mt-6" />
              
              <div className="flex items-center justify-center gap-4 py-4 opacity-30">
                <div className="h-8 w-12 bg-zinc-200 rounded" />
                <div className="h-8 w-12 bg-zinc-200 rounded" />
                <div className="h-8 w-12 bg-zinc-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
