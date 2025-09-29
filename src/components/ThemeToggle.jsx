/**
 * Composant de basculement du thème sombre/clair
 *
 * Fonctionnalités métier :
 * - Affichage d'un bouton pour basculer entre thème sombre et clair
 * - Icônes intuitives (soleil pour clair, lune pour sombre)
 * - Animation de transition fluide
 * - Accessibilité avec labels appropriés
 *
 * Objectif : Permettre aux utilisateurs de changer facilement
 * le thème de l'application selon leurs préférences.
 *
 * @created 2025-09-29
 * @author Équipe Développement
 */

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

/**
 * Composant de basculement du thème
 * @returns {JSX.Element} Bouton de basculement du thème
 */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10"
      title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      </span>
    </Button>
  )
}

export default ThemeToggle