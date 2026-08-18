'use client'
import { useEffect } from 'react'
import { useNavAction } from '@/app/context/navActionContext'


export default function SetNavCta({ href, label, onClick }) {
  const { setCta, clearCta } = useNavAction()

  useEffect(() => {
    if (!href) return
    setCta({ href, label, onClick })
    return () => clearCta()
  }, [href, label, onClick, setCta, clearCta])

  return null
}