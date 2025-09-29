/**
 * Composant de paramètres - Gestion des clés API
 *
 * Fonctionnalités métier :
 * - Gestion des clés API Google Gemini
 * - Sauvegarde des clés API utilisateur
 * - Interface utilisateur en français
 *
 * Objectif : Fournir une page centralisée pour la configuration
 * des clés API de l'application avec gestion sécurisée.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SplitConfigManager from './SplitConfigManager'

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
 * Composant de paramètres
 * Interface pour configurer l'API et le modèle Gemini
 */
function Settings({ onBack }) {
  const { apiKey, saveApiKey } = useApiKey()
  const [inputValue, setInputValue] = useState(apiKey)

  useEffect(() => {
    // Synchronisation de la valeur d'entrée avec la clé chargée
    setInputValue(apiKey)
  }, [apiKey])

  /**
   * Gestionnaire de sauvegarde de la clé API
   */
  const handleSaveApiKey = () => {
    if (inputValue.trim()) {
      saveApiKey(inputValue.trim())
    }
  }

  // Détermination du statut de sauvegarde
  const isApiKeySaved = apiKey === inputValue && apiKey !== ''

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Bouton retour */}
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            ← Retour à l'accueil
          </Button>
        </div>

        {/* Titre de la page */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">Configurez votre clé API et les paramètres de traitement</p>
        </div>

        {/* Gestionnaire de clé API */}
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
            <Button onClick={handleSaveApiKey} disabled={!inputValue.trim()}>
              Sauvegarder la clé API
            </Button>
            <div>
              <p className="text-sm">
                Statut: {isApiKeySaved ? 'Clé API sauvegardée' : 'Aucune clé sauvegardée'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuration des répartitions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration des Répartitions</h2>
          <SplitConfigManager />
        </div>


        {/* Informations supplémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• La clé API est stockée localement dans votre navigateur</p>
              <p>• Les paramètres sont sauvegardés automatiquement</p>
              <p>• Vous pouvez obtenir une clé API sur <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings