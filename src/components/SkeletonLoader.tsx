import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-800 rounded ${className}`}
    />
  );
}

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-black border-r border-gray-800 p-6 shadow-xl">
        <div className="mb-8">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <nav className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-4 py-3 rounded-lg">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-6 w-64 mb-6" />
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Profile Image Skeleton */}
          <div className="mb-12">
            <Skeleton className="w-48 h-48 mx-auto rounded-lg" />
          </div>

          {/* Skills and Interests Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <Skeleton className="h-6 w-20 mb-4" />
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24" />
                ))}
              </div>
            </div>
          </div>

          {/* Links Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function NotesPageSkeleton() {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-black border-r border-gray-800 p-6 shadow-xl">
        <div className="mb-8">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <nav className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-4 py-3 rounded-lg">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-5 w-64" />
          </div>

          {/* Notes Grid Skeleton */}
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <article key={i} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function LearningPageSkeleton() {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-black border-r border-gray-800 p-6 shadow-xl">
        <div className="mb-8">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <nav className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-4 py-3 rounded-lg">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-5 w-80" />
          </div>

          {/* Learning Items Grid Skeleton */}
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
