/**
 * Composant de gestion des configurations de répartition
 *
 * Fonctionnalités métier :
 * - Gestion des personnes/groupes pour la répartition des dépenses
 * - Association de couleurs à chaque personne
 * - Labels personnalisables pour chaque groupe
 * - Sauvegarde automatique en localStorage
 * - Interface pour ajouter/modifier/supprimer des groupes
 *
 * Objectif : Permettre une configuration flexible des règles
 * de répartition avec support de plusieurs personnes et couleurs.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useEffect, createContext, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, Trash2, Palette } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

/**
 * Obtient la couleur principale d'un groupe (même logique que TriStateCheckbox)
 * @param {Array} colors - Liste des couleurs du groupe
 * @returns {string} Classe CSS pour la couleur
 */
function getGroupColor(colors) {
  if (!colors || colors.length === 0) return 'bg-blue-500 border-blue-500 text-white'

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
  if (!colors || colors.length === 0) return 'hover:bg-blue-600'

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

const SPLIT_CONFIG_STORAGE_KEY = 'splitConfiguration'

// Couleurs disponibles pour l'association
const AVAILABLE_COLORS = [
  { name: 'Rouge', value: 'red', hex: '#ef4444', tailwind: 'bg-red-500' },
  { name: 'Rose', value: 'pink', hex: '#ec4899', tailwind: 'bg-pink-500' },
  { name: 'Orange', value: 'orange', hex: '#f97316', tailwind: 'bg-orange-500' },
  { name: 'Jaune', value: 'yellow', hex: '#eab308', tailwind: 'bg-yellow-500' },
  { name: 'Vert', value: 'green', hex: '#22c55e', tailwind: 'bg-green-500' },
  { name: 'Bleu', value: 'blue', hex: '#3b82f6', tailwind: 'bg-blue-500' },
  { name: 'Violet', value: 'purple', hex: '#a855f7', tailwind: 'bg-purple-500' }
]

const SplitConfigContext = createContext()

export function SplitConfigProvider({ children }) {
  const hookValue = useSplitConfig()
  return <SplitConfigContext.Provider value={hookValue}>{children}</SplitConfigContext.Provider>
}

// Configuration par défaut
const DEFAULT_CONFIG = [
  {
    id: 'kgb',
    name: 'KGB',
    colors: ['pink'],
    label: 'K'
  },
  {
    id: 'fcn',
    name: 'FCN',
    colors: ['yellow', 'green'],
    label: 'F'
  }
]

/**
 * Hook personnalisé pour gérer la configuration des répartitions
 */
export function useSplitConfig() {
  const context = useContext(SplitConfigContext)
  if (context) {
    return context
  }

  // Fallback implementation when not wrapped in provider
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    // Chargement depuis localStorage
    const stored = localStorage.getItem(SPLIT_CONFIG_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConfig(parsed)
      } catch (error) {
        console.warn('Erreur lors du chargement de la configuration:', error)
        setConfig(DEFAULT_CONFIG)
      }
    }
  }, [])

  /**
   * Sauvegarde la configuration
   */
  const saveConfig = (newConfig) => {
    setConfig(newConfig)
    localStorage.setItem(SPLIT_CONFIG_STORAGE_KEY, JSON.stringify(newConfig))
  }

  /**
   * Génère le prompt pour Gemini basé sur la configuration
   */
  const generateColorPrompt = () => {
    const colorMappings = config
      .filter(group => group.colors.length > 0)
      .map(group => {
        const colorNames = group.colors.map(colorValue => {
          const color = AVAILABLE_COLORS.find(c => c.value === colorValue)
          return color ? color.name.toLowerCase() : colorValue
        }).join(' or ')

        return `- ${colorNames} = ${group.name.toLowerCase()} (belongs to ${group.name})`
      })

    if (colorMappings.length === 0) {
      return '- Normal/unhighlighted = shared (common)'
    }

    return [
      ...colorMappings,
      '- Normal/unhighlighted = shared (common)'
    ].join('\n')
  }

  /**
   * Génère la description des valeurs possibles pour splitState
   */
  const generateSplitStateDescription = () => {
    const colorPrompt = generateColorPrompt()
    if (!colorPrompt) return ''

    // Générer la liste des valeurs possibles pour splitState
    // "shared" pour le groupe commun, puis les noms des autres groupes (excluant "commun")
    const possibleSplitStates = [
      'shared', // Toujours en premier pour le groupe commun
      ...config
        .filter(group => group.name.toLowerCase() !== 'commun') // Éviter les doublons
        .map(group => group.name.toLowerCase())
    ]

    return `- splitState: string (one of: "${possibleSplitStates.join('", "')}")`
  }

  /**
   * Obtient la liste des couleurs utilisées
   */
  const getUsedColors = () => {
    return config.flatMap(group => group.colors)
  }

  return {
    config,
    saveConfig,
    generateColorPrompt,
    generateSplitStateDescription,
    getUsedColors
  }
}

/**
 * Composant SplitConfigManager - Gestion des configurations de répartition
 */
function SplitConfigManager() {
  const { config, saveConfig, generateColorPrompt, generateSplitStateDescription, getUsedColors } = useSplitConfig()
  const { isDark } = useTheme()

  /**
   * Met à jour le nom d'un groupe
   */
  const handleUpdateGroupName = (groupId, newName) => {
    const updatedConfig = config.map(group =>
      group.id === groupId ? { ...group, name: newName } : group
    )
    saveConfig(updatedConfig)
  }

  /**
   * Met à jour le label d'un groupe
   */
  const handleUpdateGroupLabel = (groupId, newLabel) => {
    const updatedConfig = config.map(group =>
      group.id === groupId ? { ...group, label: newLabel.toUpperCase().charAt(0) } : group
    )
    saveConfig(updatedConfig)
  }

  /**
   * Ajoute un nouveau groupe
   */
  const handleAddGroup = () => {
    // Filtrer les groupes 'commun' pour le comptage
    const userGroups = config.filter(group => group.id !== 'commun')
    const groupNumber = userGroups.length + 1
    const newGroup = {
      id: `groupe_${groupNumber}`,
      name: `Groupe ${groupNumber}`,
      colors: [],
      label: String.fromCharCode(65 + userGroups.length) // A, B, C, etc.
    }

    const updatedConfig = [...config, newGroup]
    saveConfig(updatedConfig)
  }

  /**
   * Supprime un groupe
   */
  const handleDeleteGroup = (groupId) => {
    // Le groupe Commun n'est pas supprimable (il est géré séparément)
    const updatedConfig = config.filter(group => group.id !== groupId)
    saveConfig(updatedConfig)
  }

  /**
   * Met à jour les couleurs d'un groupe
   */
  const handleUpdateGroupColors = (groupId, colors) => {
    const updatedConfig = config.map(group =>
      group.id === groupId ? { ...group, colors } : group
    )
    saveConfig(updatedConfig)
  }


  /**
   * Toggle une couleur pour un groupe existant
   */
  const toggleColorForGroup = (groupId, colorValue) => {
    const group = config.find(g => g.id === groupId)
    if (!group) return

    const newColors = group.colors.includes(colorValue)
      ? group.colors.filter(c => c !== colorValue)
      : [...group.colors, colorValue]

    handleUpdateGroupColors(groupId, newColors)
  }

  const usedColors = getUsedColors()

  return (
    <div className="space-y-6">
      {/* Configuration existante */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Groupes de Répartition</CardTitle>
              <CardDescription>
                Configurez les groupes de personnes et leurs couleurs associées
              </CardDescription>
            </div>
            <Button onClick={handleAddGroup} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Groupe Commun (non modifiable) */}
          <div className={`flex items-center justify-between p-3 border rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Label:</span>
                <div className="flex items-center space-x-1">
                  <Input
                    value="C"
                    disabled
                    className={`w-12 text-center font-bold h-8 ${isDark ? 'bg-muted' : 'bg-gray-100'}`}
                  />
                  {/* Indicateur de couleur du label */}
                  <div
                    className="h-6 w-6 rounded border flex items-center justify-center text-xs font-bold bg-blue-500 border-blue-500 text-white"
                    title="Groupe par défaut pour les éléments sans couleur"
                  >
                    C
                  </div>
                </div>
              </div>
              <Input
                value="Commun"
                disabled
                className={`w-32 font-medium ${isDark ? 'bg-muted' : 'bg-gray-100'}`}
              />
              <div className="text-sm text-gray-500 italic">
                Groupe par défaut (éléments sans couleur)
              </div>
            </div>
          </div>

          {/* Groupes configurables (excluant Commun qui est géré séparément) */}
          {config.filter(group => group.id !== 'commun').map((group) => (
            <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Label:</span>
                  <div className="flex items-center space-x-1">
                    <Input
                      value={group.label}
                      onChange={(e) => handleUpdateGroupLabel(group.id, e.target.value)}
                      className="w-12 text-center font-bold h-8"
                      maxLength={1}
                    />
                    {/* Indicateur de couleur du label */}
                    <div
                      className={`
                        h-6 w-6 rounded border flex items-center justify-center text-xs font-bold
                        ${getGroupColor(group.colors)}
                      `}
                      title={`Couleur du label: ${group.colors.length === 1 ? 'Couleur unique du groupe' : 'Première couleur du groupe'}`}
                    >
                      {group.label}
                    </div>
                  </div>
                </div>
                <Input
                  value={group.name}
                  onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                  className="w-32 font-medium"
                  placeholder="Nom du groupe"
                />
                <div className="flex space-x-1">
                  {group.colors.map(colorValue => {
                    const color = AVAILABLE_COLORS.find(c => c.value === colorValue)
                    return color ? (
                      <div
                        key={colorValue}
                        className={`w-4 h-4 rounded-full ${color.tailwind}`}
                        title={color.name}
                      />
                    ) : null
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Sélecteur de couleurs pour ce groupe */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-32">
                      <Palette className="h-4 w-4 mr-2" />
                      Couleurs
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Couleurs associées</p>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => toggleColorForGroup(group.id, color.value)}
                            disabled={usedColors.includes(color.value) && !group.colors.includes(color.value)}
                            className={`relative flex items-center justify-center w-full h-8 rounded-md border-2 transition-all ${
                              group.colors.includes(color.value)
                                ? `${color.tailwind} border-white ring-2 ring-gray-400`
                                : `border-gray-300 hover:border-gray-400 ${color.tailwind}`
                            } ${
                              usedColors.includes(color.value) && !group.colors.includes(color.value)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                            title={color.name}
                          >
                            <span className="text-xs font-medium text-white drop-shadow">
                              {color.name}
                            </span>
                            {group.colors.includes(color.value) && (
                              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Cliquez pour associer/dissocier les couleurs
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Bouton supprimer (sauf pour Commun) */}
                {group.id !== 'commun' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


      {/* Aperçu du prompt généré */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu du Prompt IA</CardTitle>
          <CardDescription>
            Voici comment les couleurs seront interprétées par l'IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-3">
            <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
{`Also detect if any lines or amounts are highlighted with colors:
${generateColorPrompt()}

Return as a JSON array of objects with these properties:
- name: string (item name)
- amount: number (price in dollars, negative for discounts)
- taxCode: string (FP, F, P, or null if no tax indicator)
${generateSplitStateDescription()}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SplitConfigManager