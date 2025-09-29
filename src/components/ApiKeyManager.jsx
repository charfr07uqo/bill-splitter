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

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useApiKey } from '../hooks/useApiKey'

/**
 * Composant de gestion des clés API
 * Interface pour saisir automatiquement la clé Google Gemini
 */
function ApiKeyManager() {
  const { apiKey, saveApiKey } = useApiKey()
  const [inputValue, setInputValue] = useState(apiKey)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved', 'saving', 'unsaved'
  const saveTimeoutRef = useRef(null)

  useEffect(() => {
    // Synchronisation de la valeur d'entrée avec la clé chargée
    setInputValue(apiKey)
    setSaveStatus('saved')
  }, [apiKey])

  // Nettoyage du timeout lors du démontage du composant
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  /**
   * Gestionnaire de changement de la valeur d'entrée
   * Déclenche la sauvegarde automatique après un délai
   */
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSaveStatus('unsaved')

    // Annuler le timeout précédent s'il existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Sauvegarde automatique avec délai pour éviter trop d'appels
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving')

      // Sauvegarde ou effacement selon la valeur
      if (newValue.trim()) {
        saveApiKey(newValue.trim())
        setSaveStatus('saved')
      } else {
        // Effacement automatique si le champ est vide
        localStorage.removeItem(API_KEY_STORAGE_KEY)
        saveApiKey('')
        setSaveStatus('saved')
      }
    }, 1000) // Délai de 1 seconde
  }, [saveApiKey])

  /**
   * Rendu du statut de sauvegarde avec icône
   */
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Sauvegarde en cours...</span>
          </div>
        )
      case 'saved':
        return apiKey ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Clé API sauvegardée automatiquement</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Aucune clé API configurée</span>
          </div>
        )
      case 'unsaved':
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Sauvegarde automatique dans 1 seconde...</span>
          </div>
        )
      default:
        return null
    }
  }

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
            onChange={handleInputChange}
            placeholder="Entrez votre clé API"
          />
          <p className="text-xs text-gray-500 mt-1">
            La clé API est sauvegardée automatiquement après 1 seconde d'inactivité
          </p>
        </div>

        <div className="flex items-center justify-center">
          {renderSaveStatus()}
        </div>
      </CardContent>
    </Card>
  )
}

export default ApiKeyManager