/**
 * Composant Tri-State Checkbox - Cycle entre les groupes configurés
 *
 * Fonctionnalités métier :
 * - Cycle dynamique entre les groupes configurés + Commun
 * - Couleurs distinctes pour chaque groupe
 * - Interface intuitive avec un seul clic
 * - Labels personnalisables
 *
 * Objectif : Simplifier l'interface utilisateur en remplaçant
 * plusieurs checkboxes par un contrôle unique et intuitif.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React from 'react'
import { Button } from '@/components/ui/button'

/**
 * Génère la configuration des états basée sur la config des splits
 * @param {Array} splitConfig - Configuration des groupes
 * @returns {Object} Configuration des états
 */
function generateStateConfig(splitConfig = []) {
  const config = {}

  // Ajouter toujours le groupe Commun en premier
  config['commun'] = {
    label: 'C',
    color: 'bg-blue-500 border-blue-500 text-white',
    hoverColor: 'hover:bg-blue-600',
    nextState: splitConfig.length > 0 ? splitConfig[0].id : 'commun'
  }

  // Ajouter les groupes configurés
  splitConfig.forEach((group, index) => {
    const nextGroup = splitConfig[index + 1]

    config[group.id] = {
      label: group.label,
      color: getGroupColor(group.colors),
      hoverColor: getGroupHoverColor(group.colors),
      nextState: nextGroup ? nextGroup.id : 'commun'
    }
  })

  return config
}

/**
 * Obtient la couleur principale d'un groupe
 * @param {Array} colors - Liste des couleurs du groupe
 * @returns {string} Classe CSS pour la couleur
 */
function getGroupColor(colors) {
  if (!colors || colors.length === 0) return 'bg-gray-500 border-gray-500 text-white'

  // Utiliser la première couleur disponible
  const colorMap = {
    'red': 'bg-red-500 border-red-500 text-white',
    'pink': 'bg-pink-500 border-pink-500 text-white',
    'orange': 'bg-orange-500 border-orange-500 text-white',
    'yellow': 'bg-yellow-500 border-yellow-500 text-white',
    'green': 'bg-green-500 border-green-500 text-white',
    'lime': 'bg-lime-500 border-lime-500 text-white',
    'cyan': 'bg-cyan-500 border-cyan-500 text-white',
    'blue': 'bg-blue-500 border-blue-500 text-white',
    'purple': 'bg-purple-500 border-purple-500 text-white',
    'violet': 'bg-violet-500 border-violet-500 text-white'
  }

  return colorMap[colors[0]] || 'bg-gray-500 border-gray-500 text-white'
}

/**
 * Obtient la couleur de survol d'un groupe
 * @param {Array} colors - Liste des couleurs du groupe
 * @returns {string} Classe CSS pour le hover
 */
function getGroupHoverColor(colors) {
  if (!colors || colors.length === 0) return 'hover:bg-gray-600'

  const hoverMap = {
    'red': 'hover:bg-red-600',
    'pink': 'hover:bg-pink-600',
    'orange': 'hover:bg-orange-600',
    'yellow': 'hover:bg-yellow-600',
    'green': 'hover:bg-green-600',
    'lime': 'hover:bg-lime-600',
    'cyan': 'hover:bg-cyan-600',
    'blue': 'hover:bg-blue-600',
    'purple': 'hover:bg-purple-600',
    'violet': 'hover:bg-violet-600'
  }

  return hoverMap[colors[0]] || 'hover:bg-gray-600'
}

/**
 * Composant TriStateCheckbox - Checkbox multi-états dynamique
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.value - État actuel
 * @param {Function} props.onChange - Fonction appelée lors du changement d'état
 * @param {boolean} props.disabled - Si le contrôle est désactivé
 * @param {Array} props.splitConfig - Configuration des groupes de répartition
 * @returns {JSX.Element} Le composant multi-state checkbox
 */
function TriStateCheckbox({ value = 'commun', onChange, disabled = false, splitConfig = [] }) {
  const stateConfig = generateStateConfig(splitConfig)

  // Créer un mapping des noms de groupes vers leurs IDs pour gérer les valeurs Gemini
  const nameToIdMap = {}
  splitConfig.forEach(group => {
    nameToIdMap[group.name.toLowerCase()] = group.id
  })
  // Mapping spécial pour "shared" (groupe commun)
  nameToIdMap['shared'] = 'commun'

  // Convertir la valeur si elle correspond à un nom de groupe
  const actualValue = nameToIdMap[value] || value

  const config = stateConfig[actualValue] || stateConfig['commun']

  /**
   * Gestionnaire de clic - cycle vers l'état suivant
   */
  const handleClick = () => {
    if (disabled) return
    const nextState = config.nextState
    onChange(nextState)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={`
        h-8 sm:h-6 w-10 sm:w-8 p-0 text-xs sm:text-xs font-bold transition-colors duration-200
        ${config.color} ${config.hoverColor}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {config.label}
    </Button>
  )
}

export default TriStateCheckbox