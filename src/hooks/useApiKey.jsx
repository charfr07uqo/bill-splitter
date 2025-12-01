/**
 * Hook personnalisé pour gérer la clé API Google Gemini
 *
 * Fonctionnalités métier :
 * - Chargement automatique de la clé depuis localStorage
 * - Sauvegarde automatique dans localStorage
 * - Gestion centralisée de l'état de la clé API
 *
 * Objectif : Fournir une interface réutilisable pour la gestion
 * de la clé API dans toute l'application.
 *
 * @created 2025-09-29
 * @author Équipe Développement
 */

import React, { useState, useEffect, createContext, useContext } from 'react'

const API_KEY_STORAGE_KEY = 'googleGeminiApiKey'

/**
 * Contexte pour partager l'état de la clé API entre composants
 */
const ApiKeyContext = createContext()

/**
 * Provider du contexte API key
 * Doit envelopper l'application pour fournir l'état global
 */
export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    // Chargement de la clé depuis localStorage au montage
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (stored) setApiKey(stored)
  }, [])

  /**
   * Sauvegarde la clé API dans localStorage
   * Si la clé est vide, supprime l'entrée du localStorage
   * @param {string} key - La clé API à sauvegarder
   */
  const saveApiKey = (key) => {
    if (key && key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim())
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY)
    }
    setApiKey(key)
  }

  const value = {
    apiKey,
    saveApiKey
  }

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  )
}

/**
 * Hook personnalisé pour utiliser le contexte API key
 * Fournit l'accès à la clé API et la fonction de sauvegarde
 */
export function useApiKey() {
  const context = useContext(ApiKeyContext)
  if (!context) {
    throw new Error('useApiKey doit être utilisé dans un ApiKeyProvider')
  }
  return context
}