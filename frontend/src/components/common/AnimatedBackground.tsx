import React from 'react'

export default function AnimatedBackground(){
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-[-10%] top-[-20%] w-[70vw] h-[70vw] bg-gradient-to-tr from-purple-300 to-indigo-300 opacity-30 rounded-full animate-blob"></div>
      <div className="absolute right-[-10%] bottom-[-15%] w-[50vw] h-[50vw] bg-gradient-to-br from-pink-300 to-yellow-300 opacity-25 rounded-full animate-blob animation-delay-2000"></div>
    </div>
  )
}