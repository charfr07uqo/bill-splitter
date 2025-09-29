/**
 * Composant principal de l'application Bill Splitter
 *
 * Fonctionnalités métier :
 * - Gestion des clés API Google Gemini
 * - Téléchargement et affichage d'images de factures
 * - Traitement automatique des images avec Gemini
 * - Affichage des articles extraits dans un tableau
 * - Interface responsive avec gestion des états de chargement et d'erreur
 * - Navigation vers les paramètres
 * - Sélection du modèle Gemini
 *
 * Objectif : Fournir une application complète pour l'extraction
 * automatique des données de factures à partir d'images avec
 * une interface de configuration avancée.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useEffect } from 'react'
import ApiKeyManager, { useApiKey } from './components/ApiKeyManager'
import Settings from './components/Settings'
import ImageInputPanel from './components/ImageInputPanel'
import ImageDisplay from './components/ImageDisplay'
import ImageCropper from './components/ImageCropper'
import InvoiceTable from './components/InvoiceTable'
import { useGeminiProcessing } from './hooks/useGeminiProcessing'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/toaster'
import { useSplitConfig } from './components/SplitConfigManager'

// Options de modèles disponibles
const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-flash-image-preview', label: 'Gemini 2.5 Flash Image Preview' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { value: 'gemini-flash-latest', label: 'Gemini Flash Latest' }
]

const MODEL_STORAGE_KEY = 'selectedGeminiModel'

/**
 * Hook personnalisé pour gérer le modèle sélectionné
 * Fournit l'accès au modèle et la fonction de sauvegarde
 */
function useSelectedModel() {
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')

  useEffect(() => {
    // Chargement du modèle depuis localStorage au montage
    const stored = localStorage.getItem(MODEL_STORAGE_KEY)
    if (stored) setSelectedModel(stored)
  }, [])

  /**
   * Sauvegarde le modèle sélectionné dans localStorage
   * @param {string} model - Le modèle à sauvegarder
   */
  const saveSelectedModel = (model) => {
    localStorage.setItem(MODEL_STORAGE_KEY, model)
    setSelectedModel(model)
  }

  return { selectedModel, saveSelectedModel }
}

function App() {
  // État pour la navigation
  const [currentPage, setCurrentPage] = useState('main') // 'main' ou 'settings'

  // Gestion de la clé API
  const { apiKey } = useApiKey()

  // Gestion du modèle sélectionné
  const { selectedModel, saveSelectedModel } = useSelectedModel()

  // Gestion de la configuration des répartitions
  const { config: splitConfig, generateColorPrompt } = useSplitConfig()

  // Hook pour le traitement Gemini
  const { loading, error, data, rawData, processInvoice } = useGeminiProcessing()

  // Synchroniser les données avec les articles éditables
  useEffect(() => {
    if (data?.items) {
      // Créer un mapping des noms de groupes vers leurs IDs
      const nameToIdMap = {}
      splitConfig.forEach(group => {
        nameToIdMap[group.name.toLowerCase()] = group.id
      })
      // Mapping spécial pour "shared" (groupe commun)
      nameToIdMap['shared'] = 'commun'

      // Trouver le groupe par défaut (commun ou le premier disponible)
      const defaultGroup = splitConfig.find(group => group.id === 'commun') || splitConfig[0]
      const defaultSplitState = defaultGroup ? defaultGroup.id : 'commun'

      setEditableItems(data.items.map(item => ({
        ...item,
        splitState: nameToIdMap[item.splitState] || item.splitState || defaultSplitState
      })))

      // Stocker les données de résultat pour le débogage
      console.log('📊 Données stockées dans debugData.result:', data)
      console.log('🔍 Données brutes stockées dans debugData.rawResult:', rawData)
      setDebugData(prev => ({
        ...prev,
        result: data,
        rawResult: rawData
      }))
    }
  }, [data, rawData, splitConfig])

  // Mettre à jour la requête quand la configuration des couleurs change
  useEffect(() => {
    setDebugData(prev => ({
      ...prev,
      request: generateRequest()
    }))
  }, [splitConfig, generateColorPrompt])

  // État pour le fichier téléchargé
  const [uploadedFile, setUploadedFile] = useState(null)

  // État pour le fichier final (original ou recadré)
  const [finalFile, setFinalFile] = useState(null)

  // État pour le mode de recadrage
  const [isCropping, setIsCropping] = useState(false)

  // État pour les articles éditables
  const [editableItems, setEditableItems] = useState([])

  // Fonction pour générer la requête dynamiquement
  const generateRequest = () => {
    // Si l'utilisateur a une requête personnalisée, l'utiliser
    if (customRequest) {
      return customRequest
    }

    const baseRequest = `Extract item names and amounts from this invoice/receipt image. Look for tax indicators at the end of lines (FP, F, or P) which indicate applicable taxes in Quebec, Canada:

- FP = Both Federal (GST 5%) and Provincial (QST 9.975%) taxes apply
- F = Only Federal tax (GST 5%) applies
- P = Only Provincial tax (QST 9.975%) applies

Important: If an amount ends with a '-' character (like "5.00-"), it represents a discount and should be negative (e.g., "5.00-" becomes -5.00).`

    const colorPrompt = generateColorPrompt()
    const colorSection = colorPrompt ? `\n\nAlso detect if any lines or amounts are highlighted with colors:\n${colorPrompt}` : ''

    // Générer la liste des valeurs possibles pour splitState
    const possibleSplitStates = colorPrompt ? [
      ...splitConfig.map(group => group.name.toLowerCase()),
      'shared'
    ] : []

    const splitStateDescription = colorPrompt ?
      `- splitState: string (one of: "${possibleSplitStates.join('", "')}")` :
      ''

    return `${baseRequest}${colorSection}

Return as a JSON array of objects with these properties:
- name: string (item name)
- amount: number (price in dollars, negative for discounts)
- taxCode: string (FP, F, P, or null if no tax indicator)
${splitStateDescription}

Only return the JSON array, no other text or explanation.`
  }

  // État pour les données de débogage
  const [debugData, setDebugData] = useState({
    result: null,
    rawResult: null
  })

  // État pour la requête personnalisée (si l'utilisateur l'édite)
  const [customRequest, setCustomRequest] = useState(null)

  /**
   * Gestionnaire de changement de modèle
   */
  const handleModelChange = (model) => {
    saveSelectedModel(model)
  }

  /**
   * Gestionnaire de sélection d'image
   * Met à jour l'état et prépare pour le recadrage
   */
  const handleImageSelect = (file) => {
    setUploadedFile(file)
    setFinalFile(null) // Reset du fichier final
    setIsCropping(false) // Reset du mode recadrage
  }

  /**
   * Gestionnaire de validation du recadrage
   */
  const handleCropComplete = (croppedFile) => {
    setFinalFile(croppedFile)
    setIsCropping(false)
  }

  /**
   * Gestionnaire d'annulation du recadrage
   */
  const handleCropCancel = () => {
    setFinalFile(uploadedFile) // Utiliser le fichier original
    setIsCropping(false)
  }

  /**
   * Gestionnaire de modification de la requête
   */
  const handleRequestChange = (newRequest) => {
    setCustomRequest(newRequest)
  }

  /**
   * Gestionnaire de lancement manuel du traitement
   */
  const handleProcessInvoice = () => {
    const fileToProcess = finalFile || uploadedFile
    if (apiKey && fileToProcess) {
      // Générer la requête fraîche à chaque traitement
      const currentRequest = generateRequest()
      processInvoice(apiKey, fileToProcess, selectedModel, currentRequest, splitConfig)
    }
  }

  /**
   * Gestionnaire pour activer le mode recadrage
   */
  const handleStartCropping = () => {
    setIsCropping(true)
  }

  /**
   * Gestionnaire de modification des articles
   */
  const handleItemsChange = (updatedItems) => {
    setEditableItems(updatedItems)
  }

  // Affichage de la page des paramètres
  if (currentPage === 'settings') {
    return <Settings onBack={() => setCurrentPage('main')} />
  }

  // Affichage de la page principale
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation et titre */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Bill Splitter</h1>
          <div className="flex items-center space-x-4">
            {/* Sélection du modèle dans l'entête */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Modèle:</span>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sélectionnez un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {GEMINI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setCurrentPage('settings')}>
              ⚙️ Paramètres
            </Button>
          </div>
        </div>

        {/* Panneau d'entrée d'images combiné */}
        <ImageInputPanel onImageSelect={handleImageSelect} />

        {/* Interface de recadrage */}
        {isCropping && uploadedFile && (
          <div className="flex justify-center">
            <ImageCropper
              imageFile={uploadedFile}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          </div>
        )}

        {/* Affichage côte à côte : image et tableau */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Affichage de l'image avec bouton intégré */}
          <div className="xl:col-span-1">
            <ImageDisplay
              file={finalFile || uploadedFile}
              onProcessClick={handleProcessInvoice}
              onCropClick={handleStartCropping}
              loading={loading}
              apiKey={apiKey}
              showCropButton={uploadedFile && !isCropping && !finalFile}
              requestData={generateRequest()}
              resultData={debugData.result}
              rawResultData={debugData.rawResult}
              onRequestChange={handleRequestChange}
            />
          </div>

          {/* Tableau des articles avec gestion des états - prend plus d'espace */}
          <div className="xl:col-span-2 space-y-4">
            {loading && (
              <div className="text-center py-8">
                <p className="text-lg">Traitement de l'image en cours avec {selectedModel}...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-500 text-lg">Erreur lors du traitement : {error}</p>
              </div>
            )}

            {editableItems.length > 0 && (
              <div className="w-full overflow-x-auto">
                <InvoiceTable
                  items={editableItems}
                  onItemsChange={handleItemsChange}
                  loading={loading}
                  splitConfig={splitConfig}
                />
              </div>
            )}

            {!uploadedFile && !loading && !error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Téléchargez une image pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toaster pour les notifications */}
      <Toaster />
    </div>
  )
}

export default App