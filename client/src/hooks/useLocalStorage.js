// ============================================================
// useLocalStorage.js
// A custom hook that syncs state with localStorage,
// so values survive page refreshes automatically.
// ============================================================

import { useState } from 'react'

/**
 * Works exactly like useState but persists to localStorage.
 * @param {string} key - The localStorage key to store under
 * @param {any} initialValue - Default value if nothing is stored
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      // Parse stored JSON if it exists, otherwise use the default
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Wrapper function that saves to localStorage AND React state
  const setValue = (value) => {
    try {
      // Allow functions (like setState(prev => ...)) to work too
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
