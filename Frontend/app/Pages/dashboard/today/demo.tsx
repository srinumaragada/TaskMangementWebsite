import React from 'react'
import cat from "../../../../public/logo1.jpg"
import Image from 'next/image'
type Props = {
    displayName:string|null
}
const Demo = ({displayName}:Props) => {
  return (
    <div className="flex-1 p-8">
        <h1 className="font-bold text-lg mb-8 select-text">Today</h1>
        <div className="flex flex-col items-center justify-center space-y-4">
          <Image
            alt="Cat illustration"
            className="w-36 h-36"
            draggable={false}
            src={cat}
            width={150}
            height={150}
          />
          <div className="text-center max-w-xs">
            <p className="font-semibold text-gray-900">
              You're all done for today, {displayName}!
            </p>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Enjoy the rest of your day and don't forget to share your{" "}
              <span className="font-normal">#TodoistZero</span> awesomeness
            </p>
            <button className="mt-3 text-xs text-[#d35400] font-semibold hover:underline">
              Share <span>#TodoistZero</span>
            </button>
          </div>
        </div>
      </div>
  )
}

export default Demo