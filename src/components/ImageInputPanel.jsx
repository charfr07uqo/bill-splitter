/**
 * Panneau d'entrée d'images - Combinaison upload et échantillons
 *
 * Fonctionnalités métier :
 * - Upload de fichiers par glisser-déposer ou sélection
 * - Sélection d'images d'exemple disponibles
 * - Interface unifiée pour économiser l'espace
 * - Gestion des états de chargement et d'erreur
 *
 * Objectif : Fournir une interface compacte pour la sélection
 * ou l'upload d'images de factures avec des exemples pratiques.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FileUpload from './FileUpload'

// Liste des extensions d'images supportées
const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

/**
 * Fonction pour vérifier si un fichier est une image
 * @param {string} filename - Nom du fichier
 * @returns {boolean} True si c'est une image
 */
const isImageFile = (filename) => {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return supportedExtensions.includes(ext)
}

/**
 * Fonction pour créer un nom lisible à partir du nom de fichier
 * @param {string} filename - Nom du fichier
 * @returns {string} Nom lisible
 */
const createReadableName = (filename) => {
  // Enlever l'extension
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))

  // Pour les noms de fichiers PXL_..., créer un nom plus lisible
  if (nameWithoutExt.startsWith('PXL_')) {
    // Extraire la date du nom de fichier
    const dateMatch = nameWithoutExt.match(/PXL_(\d{4})(\d{2})(\d{2})_(\d{6})/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      return `Image du ${day}/${month}/${year}`
    }
  }

  // Pour les autres noms, remplacer les underscores par des espaces et capitaliser
  return nameWithoutExt
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Composant ImageInputPanel - Panneau combiné pour upload et échantillons
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onImageSelect - Fonction appelée lors de la sélection
 * @returns {JSX.Element} Le composant de panneau
 */
function ImageInputPanel({ onImageSelect }) {
  const [sampleImages, setSampleImages] = useState([])
  const [imagesLoaded, setImagesLoaded] = useState({})
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0)
  const fileInputRef = useRef(null)

  /**
   * Gestionnaire de sélection d'image d'exemple
   * @param {Object} image - L'image sélectionnée
   */
  const handleSampleImageSelect = (image) => {
    // Convertir l'URL en File object pour la compatibilité
    fetch(image.path)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], `${image.name}.jpg`, { type: 'image/jpeg' })
        onImageSelect(file)
      })
      .catch(error => {
        console.error('Erreur lors du chargement de l\'image d\'exemple:', error)
      })
  }

  /**
   * Gestionnaire de clic sur la zone d'upload
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Gestionnaire de sélection de fichier
   * @param {Event} event - Événement de changement de fichier
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      onImageSelect(file)
    }
  }

  /**
   * Navigation vers l'image précédente
   */
  const goToPreviousSample = () => {
    setCurrentSampleIndex((prev) =>
      prev === 0 ? sampleImages.length - 1 : prev - 1
    )
  }

  /**
   * Navigation vers l'image suivante
   */
  const goToNextSample = () => {
    setCurrentSampleIndex((prev) =>
      prev === sampleImages.length - 1 ? 0 : prev + 1
    )
  }

  /**
   * Vérifie si une image existe
   * @param {string} path - Chemin de l'image
   * @returns {Promise<boolean>} True si l'image existe
   */
  const checkImageExists = (path) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = path
    })
  }

  // Charger dynamiquement les images d'exemple au montage
  useEffect(() => {
    const loadSampleImages = async () => {
      // Liste des images connues dans le dossier samples
      const knownImages = [
        'PXL_20231214_145157504.jpg',
        'PXL_20240514_001755504.jpg',
        'PXL_20241024_233602796.jpg',
        'PXL_20250425_221833245.jpg',
        'PXL_20250925_232322794.jpg',
        'PXL_20251201_131009691.jpg'
      ]

      const images = []
      const loaded = {}

      for (const filename of knownImages) {
        if (isImageFile(filename)) {
          const imagePath = `/samples/${filename}`
          const exists = await checkImageExists(imagePath)

          if (exists) {
            images.push({
              id: filename,
              name: createReadableName(filename),
              path: imagePath,
              description: `Image d'exemple: ${createReadableName(filename)}`
            })
          }

          loaded[filename] = exists
        }
      }

      setSampleImages(images)
      setImagesLoaded(loaded)
    }

    loadSampleImages()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>📸 Sélection d'Image</CardTitle>
        <CardDescription>
          Téléchargez une image ou choisissez un échantillon pour commencer l'analyse
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Zone d'upload full width, reduced height */}
        <div
          className="group cursor-pointer border-2 border-dashed border-border rounded-lg p-4 hover:border-blue-400 hover:bg-accent transition-all mb-4"
          onClick={handleUploadClick}
        >
          <div className="aspect-[4/1] bg-muted rounded-md flex flex-col items-center justify-center">
            <div className="text-2xl mb-1">📤</div>
            <div className="text-xs text-center text-muted-foreground group-hover:text-blue-600">
              Télécharger une image
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground group-hover:text-blue-600 mt-2">
            Glisser-déposer ou cliquer pour sélectionner
          </p>
          {/* Input fichier caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Carousel d'échantillons d'images */}
        {sampleImages.length > 0 && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousSample}
                disabled={sampleImages.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentSampleIndex + 1} / {sampleImages.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextSample}
                disabled={sampleImages.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div
              className="group cursor-pointer border-2 border-border rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
              onClick={() => handleSampleImageSelect(sampleImages[currentSampleIndex])}
            >
              <div className="aspect-[16/9] bg-muted flex items-center justify-center overflow-hidden">
                {imagesLoaded[sampleImages[currentSampleIndex].id] ? (
                  <img
                    src={sampleImages[currentSampleIndex].path}
                    alt={sampleImages[currentSampleIndex].name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-muted-foreground text-center">
                    Image non disponible
                  </div>
                )}
              </div>
              <p className="text-sm text-center text-muted-foreground group-hover:text-blue-600 p-2">
                {sampleImages[currentSampleIndex].name}
              </p>
            </div>
          </div>
        )}

{/* Message d'aide */}
<div className="mt-4 text-center">
<p className="text-xs text-muted-foreground">
  Cliquez sur une vignette pour sélectionner une image et lancer l'analyse
</p>
</div>
      </CardContent>
    </Card>
  )
}

export default ImageInputPanel