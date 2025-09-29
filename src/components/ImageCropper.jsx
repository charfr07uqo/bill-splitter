/**
 * Composant de recadrage d'image - Outil de crop pour les factures avec zoom
 *
 * Fonctionnalités métier :
 * - Interface de recadrage intuitive avec sélection rectangulaire
 * - Contrôles de zoom pour agrandir l'image (50% à 300%)
 * - Mode plein écran sur mobile pour une meilleure visibilité
 * - Aperçu en temps réel du résultat
 * - Boutons de validation et d'annulation
 * - Export de l'image recadrée pour le traitement
 *
 * Objectif : Permettre à l'utilisateur de sélectionner
 * précisément la zone de la facture à analyser, éliminant
 * les éléments parasites de l'image, avec possibilité
 * d'agrandir l'image pour plus de précision.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useRef, useCallback } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Composant ImageCropper - Outil de recadrage d'image avec zoom
 * @param {Object} props - Les propriétés du composant
 * @param {File} props.imageFile - Le fichier image original
 * @param {Function} props.onCropComplete - Fonction appelée avec l'image recadrée
 * @param {Function} props.onCancel - Fonction appelée pour annuler le recadrage
 * @returns {JSX.Element} Le composant de recadrage
 */
function ImageCropper({ imageFile, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [imageSrc, setImageSrc] = useState('')
  const [zoom, setZoom] = useState(1)
  const imgRef = useRef(null)

  // Charger l'image
  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = () => setImageSrc(reader.result)
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile])

  /**
   * Gestionnaire de chargement de l'image
   */
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget

    // Créer un crop initial centré
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        16 / 9, // Ratio par défaut
        width,
        height
      ),
      width,
      height
    )

    setCrop(crop)
  }, [])

  /**
   * Générer l'image recadrée
   */
  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const image = imgRef.current

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // Créer un nouveau fichier avec le blob recadré
          const croppedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now(),
          })
          resolve(croppedFile)
        } else {
          resolve(null)
        }
      }, imageFile.type)
    })
  }, [completedCrop, imageFile])

  /**
   * Gestionnaire de validation du recadrage
   */
  const handleCropConfirm = async () => {
    const croppedFile = await getCroppedImg()
    if (croppedFile && onCropComplete) {
      onCropComplete(croppedFile)
    }
  }

  /**
   * Gestionnaire d'annulation
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  if (!imageSrc) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Chargement de l'image...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full md:max-w-4xl md:mx-auto md:h-auto md:flex md:flex-col md:justify-center">
      <CardHeader>
        <CardTitle className="text-center">Recadrer la Facture</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Sélectionnez la zone contenant la facture
        </p>
        {/* Contrôles de zoom */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            disabled={zoom <= 0.5}
          >
            Zoom -
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            disabled={zoom >= 3}
          >
            Zoom +
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-center h-full md:h-auto">
        <div className="flex justify-center flex-1">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={setCompletedCrop}
            zoom={zoom}
            onZoomChange={setZoom}
            aspect={undefined} // Pas de ratio forcé pour les factures
            className="max-w-full max-h-full md:max-h-[70vh]"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Image à recadrer"
              onLoad={onImageLoad}
              className="max-w-full max-h-full object-contain"
            />
          </ReactCrop>
        </div>

        <div className="flex justify-center space-x-4 mt-auto">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button
            onClick={handleCropConfirm}
            disabled={!completedCrop}
            className="bg-green-600 hover:bg-green-700"
          >
            Valider le recadrage
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Utilisez la souris pour ajuster la zone de sélection ou les boutons de zoom
        </div>
      </CardContent>
    </Card>
  )
}

export default ImageCropper