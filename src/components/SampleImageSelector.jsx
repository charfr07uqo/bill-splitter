/**
 * Sélecteur d'images d'exemple - Composant pour choisir des images de test
 *
 * Fonctionnalités métier :
 * - Affichage des images d'exemple disponibles
 * - Sélection d'une image pour traitement
 * - Interface utilisateur intuitive en français
 *
 * Objectif : Faciliter les tests en permettant de sélectionner
 * rapidement des images d'exemple sans avoir à les uploader manuellement.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Composant de sélection d'images d'exemple
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onImageSelect - Fonction appelée lors de la sélection
 */
function SampleImageSelector({ onImageSelect }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [sampleImages, setSampleImages] = useState([])
  const [imagesLoaded, setImagesLoaded] = useState({})

  // Liste des extensions d'images supportées
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

  // Fonction pour vérifier si un fichier est une image
  const isImageFile = (filename) => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return supportedExtensions.includes(ext)
  }

  // Fonction pour créer un nom lisible à partir du nom de fichier
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
   * Gestionnaire de sélection d'image
   * @param {Object} image - L'image sélectionnée
   */
  const handleImageSelect = (image) => {
    setSelectedImage(image)

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
   * Vérifie si une image existe
   * @param {string} path - Chemin de l'image
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🖼️ Images d'Exemple</CardTitle>
        <CardDescription>
          Sélectionnez une image d'exemple pour tester l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleImages.map((image) => (
            <div
              key={image.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedImage?.id === image.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleImageSelect(image)}
            >
              <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                {imagesLoaded[image.id] ? (
                  <img
                    src={image.path}
                    alt={image.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="text-gray-400 text-sm text-center">
                    Image non disponible
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm mb-1">{image.name}</h3>
              <p className="text-xs text-gray-600">{image.description}</p>
              {imagesLoaded[image.id] && (
                <div className="mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Disponible
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {sampleImages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune image d'exemple trouvée.</p>
            <p className="text-sm mt-2">Ajoutez des images dans le dossier public/samples/</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Comment ajouter des images d'exemple :</strong><br />
            Placez vos images dans le dossier <code className="bg-blue-100 px-1 rounded">public/samples/</code>
            et elles apparaîtront automatiquement ici.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SampleImageSelector