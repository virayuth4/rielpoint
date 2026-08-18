'use client'
import { useEffect } from 'react'
import { useNavAction } from '@/app/context/navActionContext'


export default function SetNavCta({ href, label }) {
  const { setCta, clearCta } = useNavAction()

  useEffect(() => {
    if (!href) return
    setCta({ href, label })
    return () => clearCta()
  }, [href, label, setCta, clearCta])

  return null
}