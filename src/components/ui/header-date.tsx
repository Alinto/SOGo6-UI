'use client'

import { useLocale } from 'next-intl'
import React, { useEffect, useState } from 'react'

export const getDateDetails = (locale: string) => {
  const now = new Date()
  const dayName = now.toLocaleString(locale, { weekday: 'long' }).toUpperCase()
  const month = now.toLocaleString(locale, { month: 'long' }).toUpperCase()
  const year = now.getFullYear()
  const dayNumber = now.getDate().toString().padStart(2, '0')
  return { dayName, month, year, dayNumber }
}

const HeaderDate: React.FC = () => {
  const currentLocale = useLocale()
  const [dateDetails, setDateDetails] = useState<{
    dayName: string
    month: string
    year: number
    dayNumber: string
  }>({ dayName: '', month: '', year: 0, dayNumber: '' })

  useEffect(() => {
    const updateDate = () => {
      setDateDetails(getDateDetails(currentLocale))
    }

    updateDate()
    const interval = setInterval(updateDate, 1000)

    return () => clearInterval(interval)
  }, [currentLocale])

  const { dayName, month, year, dayNumber } = dateDetails
  return (
    <div className="flex items-center h-full">
      <div className="flex flex-col items-start">
        <span className="text-white text-sm">{dayName}</span>
        <span className="text-white text-sm">{month}</span>
        <span className="text-white text-sm">{year}</span>
      </div>
      <div className="flex-grow flex justify-end items-center h-full">
        <span className="text-white text-6xl ml-4 font-thin">{dayNumber}</span>
      </div>
    </div>
  )
}

export default HeaderDate
