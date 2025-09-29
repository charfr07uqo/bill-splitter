/**
 * Composant de toast personnalisé avec barre de progression
 *
 * Fonctionnalités métier :
 * - Affichage d'un toast avec titre et description
 * - Barre de progression qui se remplit pendant le délai
 * - Bouton d'action pour annuler/interagir
 * - Disparition automatique après le délai
 *
 * Objectif : Fournir une interface utilisateur élégante
 * pour les actions temporaires avec feedback visuel du temps restant.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Composant CustomToastWithProgress - Toast avec barre de progression
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Titre du toast
 * @param {string} props.description - Description du toast
 * @param {Function} props.onAction - Fonction appelée lors du clic sur le bouton d'action
 * @param {string} props.actionLabel - Label du bouton d'action
 * @param {number} props.duration - Durée en millisecondes (défaut: 5000)
 * @param {Function} props.onTimeout - Fonction appelée à la fin du délai
 * @returns {JSX.Element} Le composant de toast
 */
function CustomToastWithProgress({
  title,
  description,
  onAction,
  actionLabel = "Annuler",
  duration = 5000,
  onTimeout
}) {
  const [progress, setProgress] = useState(100)
  const [timeLeft, setTimeLeft] = useState(duration / 1000)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      const progressPercent = (remaining / duration) * 100

      setProgress(progressPercent)
      setTimeLeft(Math.ceil(remaining / 1000))

      if (remaining <= 0) {
        clearInterval(interval)
        if (onTimeout) onTimeout()
      }
    }, 50) // Mise à jour toutes les 50ms pour fluidité

    return () => clearInterval(interval)
  }, [duration, onTimeout])

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        {/* En-tête du toast */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-3 mb-3">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-red-500 h-1 rounded-full transition-all duration-50 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {timeLeft}s
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="text-xs"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CustomToastWithProgress