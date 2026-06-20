import React from 'react'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

const StarRating = ({ rating = 0, size = 'sm', showCount = true, reviews = 0 }) => {
  const stars = []
  const iconSize = size === 'xs' ? 10 : size === 'sm' ? 14 : size === 'md' ? 18 : 22
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars.push(<FaStar key={i} size={iconSize} className="text-amber-400 fill-current" />)
    else if (i - 0.5 <= rating) stars.push(<FaStarHalfAlt key={i} size={iconSize} className="text-amber-400 fill-current" />)
    else stars.push(<FaRegStar key={i} size={iconSize} className="text-slate-600" />)
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{stars}</div>
      {showCount && <span className="text-slate-500 text-xs font-medium ml-1">({reviews})</span>}
    </div>
  )
}

export default StarRating
