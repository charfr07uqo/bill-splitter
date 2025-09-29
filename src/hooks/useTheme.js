/**
 * Hook personnalisé pour la gestion du thème sombre/clair
 *
 * Fonctionnalités métier :
 * - Gestion de l'état du thème (sombre/clair)
 * - Persistance du thème dans localStorage
 * - Application automatique de la classe 'dark' sur l'élément document
 * - Détection automatique de la préférence système
 *
 * Objectif : Fournir une gestion cohérente du thème
 * dans toute l'application avec persistance et synchronisation.
 *
 * @created 2025-09-29
 * @author Équipe Développement
 */

import { useState, useEffect } from 'react'

const THEME_STORAGE_KEY = 'theme'
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
}

/**
 * Hook pour gérer le thème de l'application
 * @returns {Object} État et fonctions du thème
 */
export function useTheme() {
  // État initial basé sur localStorage ou préférence système
  const [theme, setTheme] = useState(() => {
    // Vérifier localStorage d'abord
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && Object.values(THEMES).includes(stored)) {
      return stored
    }

    // Sinon, détecter la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK
    }

    return THEMES.LIGHT
  })

  // Appliquer le thème au document quand il change
  useEffect(() => {
    const root = document.documentElement

    if (theme === THEMES.DARK) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Sauvegarder dans localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  /**
   * Bascule entre les thèmes sombre et clair
   */
  const toggleTheme = () => {
    setTheme(prevTheme =>
      prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    )
  }

  /**
   * Définit explicitement le thème
   * @param {string} newTheme - Le nouveau thème (THEMES.LIGHT ou THEMES.DARK)
   */
  const setThemeExplicitly = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme)
    }
  }

  return {
    theme,
    isDark: theme === THEMES.DARK,
    isLight: theme === THEMES.LIGHT,
    toggleTheme,
    setTheme: setThemeExplicitly,
    themes: THEMES
  }
}