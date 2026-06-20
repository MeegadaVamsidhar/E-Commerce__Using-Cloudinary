import React from 'react'

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/5 bg-white/2 p-4 animate-pulse">
    <div className="w-full h-48 rounded-xl bg-white/5 mb-4" />
    <div className="w-2/3 h-3 rounded bg-white/5 mb-3" />
    <div className="w-full h-4 rounded bg-white/5 mb-2" />
    <div className="w-full h-4 rounded bg-white/5 mb-4" />
    <div className="flex justify-between items-center"><div className="w-20 h-5 rounded bg-white/5" /><div className="w-10 h-3 rounded bg-white/5" /></div>
  </div>
)

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="product-grid">{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}</div>
)

export default SkeletonCard
