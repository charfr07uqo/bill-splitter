/**
 * Composant de gestion des clés API - Configuration et stockage des clés API
 *
 * Fonctionnalités métier :
 * - Saisie et sauvegarde de la clé API Google Gemini
 * - Chargement automatique de la clé depuis localStorage
 * - Affichage du statut de sauvegarde
 * - Interface utilisateur en français
 *
 * Objectif : Permettre aux utilisateurs de configurer
 * et gérer leurs clés API de manière sécurisée et intuitive.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
   * @param {string} key - La clé API à sauvegarder
   */
  const saveApiKey = (key) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key)
    setApiKey(key)
  }

  return { apiKey, saveApiKey }
}

/**
 * Composant de gestion des clés API
 * Interface pour saisir et sauvegarder la clé Google Gemini
 */
function ApiKeyManager() {
  const { apiKey, saveApiKey } = useApiKey()
  const [inputValue, setInputValue] = useState(apiKey)

  useEffect(() => {
    // Synchronisation de la valeur d'entrée avec la clé chargée
    setInputValue(apiKey)
  }, [apiKey])

  /**
   * Gestionnaire de sauvegarde de la clé API
   */
  const handleSave = () => {
    if (inputValue.trim()) {
      saveApiKey(inputValue.trim())
    }
  }

  // Détermination du statut de sauvegarde
  const isSaved = apiKey === inputValue && apiKey !== ''

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion de la Clé API</CardTitle>
        <CardDescription>Configurez votre clé API Google Gemini</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="api-key">Clé API Google Gemini</Label>
          <Input
            id="api-key"
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Entrez votre clé API"
          />
        </div>
        <Button onClick={handleSave} disabled={!inputValue.trim()}>
          Sauvegarder
        </Button>
        <div>
          <p className="text-sm">
            Statut: {isSaved ? 'Clé API sauvegardée' : 'Aucune clé sauvegardée'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ApiKeyManager