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

import { useState, useEffect } from 'react'

const API_KEY_STORAGE_KEY = 'googleGeminiApiKey'

/**
 * Hook personnalisé pour gérer la clé API
 * Fournit l'accès à la clé API et la fonction de sauvegarde
 */
export function useApiKey() {
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

  return { apiKey, saveApiKey }
}