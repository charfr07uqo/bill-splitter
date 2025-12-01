import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image, MessageSquare, FileText, ChevronDown, Zap } from 'lucide-react'
import ImageCropper from './ImageCropper'
import ApiKeyGuide from './ApiKeyGuide'

/**
 * Composant d'affichage d'image - Affiche une image avec bouton d'analyse intégré
 *
 * Fonctionnalités métier :
 * - Création d'une URL blob pour l'affichage de l'image
 * - Gestion des erreurs si aucune image n'est fournie
 * - Libération automatique de la mémoire avec revokeObjectURL
 * - Bouton d'analyse intégré dans le conteneur
 * - Interface responsive avec Tailwind CSS
 *
 * Objectif : Fournir un composant réutilisable pour afficher
 * des images téléchargées par l'utilisateur avec contrôle d'analyse intégré.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */
function ImageDisplay({ file, onProcessClick, onCropClick, loading, apiKey, showCropButton = false, requestData = null, resultData = null, rawResultData = null, onRequestChange = null, isCropping = false, onCropComplete = null, onCropCancel = null, uploadedFile = null, onGoToSettings = null, selectedModel = null, onModelChange = null, geminiModels = [] }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [activeTab, setActiveTab] = useState('image')

  useEffect(() => {
    // Création de l'URL blob si un fichier est fourni
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)

      // Basculer automatiquement vers l'onglet image lors du chargement d'une nouvelle image
      setActiveTab('image')

      // Nettoyage automatique de l'URL pour éviter les fuites mémoire
      return () => URL.revokeObjectURL(url)
    } else {
      // Réinitialisation si aucun fichier
      setImageUrl(null)
    }
  }, [file])

  // Basculer vers l'onglet image quand le mode recadrage est activé
  useEffect(() => {
    if (isCropping) {
      setActiveTab('image')
    }
  }, [isCropping])

  // Gestion du cas où aucune image n'est fournie
  if (!imageUrl) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-muted-foreground text-center">
            Aucune image fournie
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto xl:sticky xl:top-4">
      <CardContent className="p-4">
        {/* Boutons d'action intégrés en haut */}
        <div className="space-y-2 mb-4">
          {/* Bouton de recadrage */}
          {showCropButton && onCropClick && (
            <div className="flex justify-center">
              <Button
                onClick={onCropClick}
                variant="outline"
                className="w-full"
              >
                ✂️ Recadrer l'image
              </Button>
            </div>
          )}

          {/* Bouton d'analyse ou guide API key */}
          {apiKey && onProcessClick ? (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={loading}
                    className="w-full"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {loading ? '🔄 Analyse en cours...' : `🚀 Lancer l'analyse`}
                    {!loading && <ChevronDown className="h-4 w-4 ml-2" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64">
                  {/* Sélecteur de modèle */}
                  <div className="p-3 border-b">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Modèle Gemini
                    </label>
                    <Select
                      value={selectedModel || ''}
                      onValueChange={onModelChange}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        {geminiModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Bouton d'analyse */}
                  <DropdownMenuItem
                    onClick={onProcessClick}
                    disabled={loading}
                    className="w-full justify-center font-medium"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {loading ? 'Analyse en cours...' : 'Lancer l\'analyse'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            onGoToSettings && (
              <ApiKeyGuide onGoToSettings={onGoToSettings} />
            )
          )}
        </div>

        {/* Onglets pour l'affichage du contenu */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="image" className="flex items-center gap-1 text-xs sm:text-sm h-10 sm:h-8">
                <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Image</span>
                <span className="sm:hidden">Img</span>
              </TabsTrigger>
              <TabsTrigger value="request" className="flex items-center gap-1 text-xs sm:text-sm h-10 sm:h-8">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Requête</span>
                <span className="sm:hidden">Req</span>
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center gap-1 text-xs sm:text-sm h-10 sm:h-8">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Brut</span>
                <span className="sm:hidden">Raw</span>
              </TabsTrigger>
              <TabsTrigger value="result" className="flex items-center gap-1 text-xs sm:text-sm h-10 sm:h-8">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Traité</span>
                <span className="sm:hidden">Res</span>
              </TabsTrigger>
            </TabsList>

          {/* Onglet Image */}
          <TabsContent value="image" className="mt-4">
            {isCropping && uploadedFile ? (
              <ImageCropper
                imageFile={uploadedFile}
                onCropComplete={onCropComplete}
                onCancel={onCropCancel}
                showZoomControls={false}
              />
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <img
                    src={imageUrl}
                    alt="Image téléchargée - Cliquez pour agrandir"
                    className="max-w-full max-h-[60vh] h-auto rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 object-contain"
                  />
                </DialogTrigger>
                <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/90">
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Image en plein écran"
                      className="max-w-full max-h-full object-contain"
                      style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100vw',
                        maxHeight: '100vh'
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Onglet Requête */}
          <TabsContent value="request" className="mt-4">
            <div className="bg-gray-900 rounded-lg p-3">
              <textarea
                value={requestData || ''}
                onChange={(e) => onRequestChange && onRequestChange(e.target.value)}
                placeholder="Entrez votre requête pour Gemini ici..."
                className="w-full bg-transparent text-green-400 font-mono text-sm resize-none border-none outline-none placeholder-gray-500"
                style={{
                  fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                  height: '576px'  // 3x la hauteur originale (192px * 3)
                }}
              />
            </div>
          </TabsContent>

          {/* Onglet Brut */}
          <TabsContent value="raw" className="mt-4">
            <div className="bg-gray-900 rounded-lg p-3 overflow-y-auto" style={{ height: '576px' }}>
              {rawResultData ? (
                <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono" style={{ fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace' }}>
                  {JSON.stringify(rawResultData, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Aucun résultat brut disponible
                </p>
              )}
            </div>
          </TabsContent>

          {/* Onglet Traité */}
          <TabsContent value="result" className="mt-4">
            <div className="bg-gray-900 rounded-lg p-3 overflow-y-auto" style={{ height: '576px' }}>
              {resultData ? (
                <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono" style={{ fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace' }}>
                  {JSON.stringify(resultData, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Aucun résultat disponible
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ImageDisplay