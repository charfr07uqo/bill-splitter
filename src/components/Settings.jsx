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

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import SplitConfigManager from './SplitConfigManager'
import { useApiKey } from '../hooks/useApiKey'


/**
 * Composant de paramètres
 * Interface pour configurer l'API et le modèle Gemini
 */
function Settings({ onBack }) {
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