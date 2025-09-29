/**
 * Composant de téléchargement de fichier - Gestion du téléchargement d'images
 *
 * Fonctionnalités métier :
 * - Téléchargement par glisser-déposer ou sélection manuelle
 * - Validation des types de fichiers image uniquement
 * - Retour visuel pendant le survol du glisser-déposer
 * - Transmission du fichier sélectionné au composant parent
 *
 * Objectif : Permettre aux utilisateurs de télécharger facilement
 * des images avec une interface intuitive et sécurisée.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Composant FileUpload pour le téléchargement d'images
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onFileSelect - Callback appelé avec le fichier sélectionné
 * @returns {JSX.Element} Élément JSX du composant
 */
function FileUpload({ onFileSelect }) {
  // État pour le fichier sélectionné
  const [selectedFile, setSelectedFile] = useState(null)
  // État pour indiquer si on survole la zone de dépôt
  const [isDragOver, setIsDragOver] = useState(false)
  // Référence pour l'input de fichier caché
  const fileInputRef = useRef(null)

  /**
   * Gère l'événement de survol du glisser-déposer
   * Active le retour visuel
   */
  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  /**
   * Gère l'événement de sortie du survol du glisser-déposer
   * Désactive le retour visuel
   */
  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  /**
   * Gère l'événement de dépôt de fichier
   * Valide et traite le fichier déposé
   */
  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)

    const files = event.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  /**
   * Gère la sélection manuelle de fichier
   * Traite le fichier sélectionné via l'input
   */
  const handleFileSelect = (event) => {
    const files = event.target.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  /**
   * Traite et valide le fichier sélectionné
   * Vérifie qu'il s'agit d'une image et appelle le callback
   */
  const processFile = (file) => {
    // Vérifier que c'est un fichier image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner uniquement des fichiers image (JPG, PNG, etc.)')
      return
    }

    setSelectedFile(file)
    if (onFileSelect) {
      onFileSelect(file)
    }
  }

  /**
   * Déclenche la sélection manuelle de fichier
   * Simule un clic sur l'input caché
   */
  const triggerFileSelect = () => {
    fileInputRef.current.click()
  }

  return (
    <Card
      className={`w-full max-w-md mx-auto transition-all duration-200 ${
        isDragOver
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          {/* Zone de dépôt avec icône et texte */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDragOver ? 'bg-primary/10' : 'bg-muted'
            }`}>
              <svg
                className={`w-8 h-8 ${
                  isDragOver ? 'text-primary' : 'text-muted-foreground'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-medium">
                {isDragOver ? 'Déposez le fichier ici' : 'Glissez et déposez une image'}
              </p>
              <p className="text-sm text-muted-foreground">
                ou cliquez pour sélectionner un fichier
              </p>
            </div>
          </div>

          {/* Bouton de sélection manuelle */}
          <Button
            onClick={triggerFileSelect}
            variant="outline"
            className="w-full"
          >
            Sélectionner un fichier
          </Button>

          {/* Input caché pour la sélection manuelle */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Affichage du fichier sélectionné */}
          {selectedFile && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Fichier sélectionné :</p>
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                Taille : {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default FileUpload