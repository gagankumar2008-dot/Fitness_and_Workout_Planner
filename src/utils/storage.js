import { useEffect, useState } from 'react'

export function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : typeof initialValue === 'function' ? initialValue() : initialValue
    } catch (error) {
      console.error(`Could not read ${key} from localStorage`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Could not save ${key} to localStorage`, error)
    }
  }, [key, value])

  return [value, setValue]
}

export function getLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}
