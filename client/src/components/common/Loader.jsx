import React from 'react'

const Loader = ({ size = 'md', fullScreen = false, text = '' }) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6 border-2' : size === 'lg' ? 'w-16 h-16 border-[3px]' : 'w-10 h-10 border-[3px]'
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeClass} rounded-full border-primary-500/20 border-t-primary-500 animate-spin`} />
      {text && <p className="text-slate-400 text-sm font-medium animate-pulse">{text}</p>}
    </div>
  )
  if (fullScreen) return <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#05041a]">{content}</div>
  return <div className="flex items-center justify-center p-4">{content}</div>
}

export default Loader
