'use client'
import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const NavActionContext = createContext(null)

export function NavActionProvider({ children }) {
  const [cta, setCtaState] = useState(null) // { href, label } | null

  // Stable setter so effects in child pages don't re-fire on every render
  const setCta = useCallback((next) => {
    setCtaState(next)
  }, [])

  const clearCta = useCallback(() => {
    setCtaState(null)
  }, [])

  const value = useMemo(() => ({ cta, setCta, clearCta }), [cta, setCta, clearCta])

  return (
    <NavActionContext.Provider value={value}>
      {children}
    </NavActionContext.Provider>
  )
}

export function useNavAction() {
  const ctx = useContext(NavActionContext)
  if (!ctx) {
    throw new Error('useNavAction must be used within a NavActionProvider')
  }
  return ctx
}