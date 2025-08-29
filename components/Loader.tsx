import React from 'react'

const Loader = ({size = 10}: {size?: number}) => {
  return (
    <div className="flex items-center justify-center">
        <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-gray-100`}></div>
    </div>
  )
}

export default Loader