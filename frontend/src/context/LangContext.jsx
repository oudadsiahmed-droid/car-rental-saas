import { createContext, useContext, useState } from 'react'
import ar from '../locales/ar/translation'
import fr from '../locales/fr/translation'
import en from '../locales/en/translation'

const translations = { ar, fr, en }

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ar')
  const t = translations[lang]

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}