/**
 * Composant de guide pour obtenir la clé API Gemini
 *
 * Fonctionnalités métier :
 * - Affichage des instructions pour obtenir une clé API Google Gemini
 * - Lien direct vers la page de création de clé API
 * - Interface utilisateur en français
 * - Bouton pour accéder aux paramètres de configuration
 *
 * Objectif : Guider les utilisateurs pour configurer
 * leur clé API Gemini de manière simple et intuitive.
 *
 * @created 2025-09-29
 * @author Équipe Développement
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ExternalLink, Settings } from 'lucide-react'

/**
 * Composant de guide pour la configuration de la clé API Gemini
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onGoToSettings - Fonction appelée pour aller aux paramètres
 */
function ApiKeyGuide({ onGoToSettings }) {
  const handleOpenApiKeysPage = () => {
    window.open('https://aistudio.google.com/api-keys', '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="w-full max-w-md mx-auto border-amber-200 bg-amber-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <CardTitle className="text-amber-800">
          Clé API Gemini Requise
        </CardTitle>
        <CardDescription className="text-amber-700">
          Pour analyser vos factures, vous devez configurer une clé API Google Gemini.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm text-amber-800">
          <div className="font-medium">Comment obtenir votre clé API :</div>

          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>
              Rendez-vous sur{' '}
              <button
                onClick={handleOpenApiKeysPage}
                className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
              >
                Google AI Studio
                <ExternalLink className="h-3 w-3" />
              </button>
            </li>
            <li>Cliquez sur "Créer une clé API"</li>
            <li>Copiez la clé générée</li>
            <li>Revenez ici et cliquez sur "Paramètres" ci-dessous</li>
            <li>Collez votre clé API dans le champ approprié</li>
          </ol>
        </div>

        <div className="bg-amber-100 p-3 rounded-lg">
          <p className="text-xs text-amber-700">
            <strong>Note :</strong> La clé API est stockée localement dans votre navigateur
            et n'est jamais transmise à des serveurs externes.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleOpenApiKeysPage}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir Google AI Studio
          </Button>

          <Button
            onClick={onGoToSettings}
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            <Settings className="h-4 w-4 mr-2" />
            Aller aux Paramètres
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ApiKeyGuide