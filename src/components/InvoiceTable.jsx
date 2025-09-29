/**
 * Composant de tableau de facture - Tableau éditable d'articles avec calcul du total, taxes et répartition
 *
 * Fonctionnalités métier :
 * - Affichage d'une liste d'articles avec noms, montants de base et taxes
 * - Édition en ligne des montants et codes de taxes
 * - Calcul automatique des taxes GST (5%) et QST (9.975%) du Québec
 * - Support des codes de taxes (FP, F, P) selon les normes québécoises
 * - Répartition automatique entre groupes configurés
 * - Calcul automatique du montant total incluant les taxes
 * - Gestion de l'état vide (aucun article)
 * - Interface responsive : tableau desktop, cartes mobiles
 * - Interface en français avec montants en dollars canadiens
 * - Optimisation mobile avec layout adaptatif et cibles tactiles agrandies
 *
 * Objectif : Fournir un tableau complet et professionnel
 * pour visualiser et modifier les éléments d'une facture avec calcul précis des taxes et répartition,
 * optimisé pour une utilisation fluide sur tous les appareils.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Plus, Trash2 } from "lucide-react"
import TriStateCheckbox from "./TriStateCheckbox"

/**
 * Obtient la classe CSS pour la couleur claire d'un groupe
 * @param {Array} colors - Liste des couleurs du groupe
 * @returns {string} Classe CSS pour la couleur claire
 */
function getGroupLightColor(colors) {
  if (!colors || colors.length === 0) return 'bg-gray-50 text-gray-800'

  const lightMap = {
    'red': 'bg-red-50 text-red-800',
    'pink': 'bg-pink-50 text-pink-800',
    'orange': 'bg-orange-50 text-orange-800',
    'yellow': 'bg-yellow-50 text-yellow-800',
    'green': 'bg-green-50 text-green-800',
    'lime': 'bg-lime-50 text-lime-800',
    'cyan': 'bg-cyan-50 text-cyan-800',
    'blue': 'bg-blue-50 text-blue-800',
    'purple': 'bg-purple-50 text-purple-800',
    'violet': 'bg-violet-50 text-violet-800'
  }

  return lightMap[colors[0]] || 'bg-gray-50 text-gray-800'
}

/**
 * Composant InvoiceTable - Tableau éditable d'articles avec calcul du total, taxes et répartition
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.items - Tableau d'objets avec name, amount, et taxCode
 * @param {Function} props.onItemsChange - Fonction appelée lors de modification des articles
 * @returns {JSX.Element} Le composant de tableau
 */
function InvoiceTable({ items = [], onItemsChange, loading = false, splitConfig = [] }) {
  // État local pour les articles éditables
  const [editableItems, setEditableItems] = useState(items)

  // État pour les suppressions en attente (remplace le toast)
  const [pendingDeletions, setPendingDeletions] = useState(new Map())

  // État pour la ligne nouvellement ajoutée (pour surbrillance)
  const [newlyAddedIndex, setNewlyAddedIndex] = useState(null)

  // Hook pour les notifications
  const { toast } = useToast()

  // Synchroniser editableItems avec les props items
  useEffect(() => {
    const normalizedItems = items.map(item => ({
      ...item,
      amount: item.amount ? item.amount.toString() : "0.00"
    }))
    setEditableItems(normalizedItems)
  }, [items])

  // Nettoyer la surbrillance de la ligne nouvellement ajoutée après 3 secondes
  useEffect(() => {
    if (newlyAddedIndex !== null) {
      const timer = setTimeout(() => {
        setNewlyAddedIndex(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [newlyAddedIndex])

  // Taux de taxes du Québec
  const GST_RATE = 0.05; // Taxe fédérale (GST)
  const QST_RATE = 0.09975; // Taxe provinciale (QST)

  // Calcul des taxes pour chaque article
  const calculateItemTaxes = (item) => {
    const baseAmount = parseFloat(item.amount) || 0;
    let gst = 0;
    let qst = 0;

    switch (item.taxCode) {
      case 'FP':
        gst = baseAmount * GST_RATE;
        qst = baseAmount * QST_RATE;
        break;
      case 'F':
        gst = baseAmount * GST_RATE;
        break;
      case 'P':
        qst = baseAmount * QST_RATE;
        break;
      default:
        // Pas de taxes si pas de code
        break;
    }

    return { gst, qst, total: baseAmount + gst + qst };
  };

  // Gestionnaire de modification du montant
  const handleAmountChange = (index, newAmount) => {
    const updatedItems = [...editableItems]
    updatedItems[index] = { ...updatedItems[index], amount: newAmount }
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)
  }

  // Gestionnaire de formatage à la sortie du champ
  const handleAmountBlur = (index) => {
    const updatedItems = [...editableItems]
    const currentAmount = updatedItems[index].amount

    // Conversion et formatage à 2 décimales
    const numericValue = parseFloat(currentAmount) || 0
    const formattedValue = numericValue.toFixed(2)

    updatedItems[index] = { ...updatedItems[index], amount: formattedValue }
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)
  }

  // Gestionnaire de modification du code de taxe
  const handleTaxCodeChange = (index, newTaxCode) => {
    const updatedItems = [...editableItems]
    updatedItems[index] = { ...updatedItems[index], taxCode: newTaxCode === 'rien' ? null : newTaxCode }
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)
  }

  // Gestionnaire du tri-state checkbox
  const handleSplitStateChange = (index, newState) => {
    const updatedItems = [...editableItems]
    updatedItems[index] = { ...updatedItems[index], splitState: newState }
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)
  }

  // Gestionnaire d'ajout de ligne
  const handleAddRow = (index) => {
    // Trouver le groupe par défaut (commun ou le premier disponible)
    const defaultGroup = splitConfig.find(group => group.id === 'commun') || splitConfig[0]
    const defaultSplitState = defaultGroup ? defaultGroup.id : 'commun'

    const updatedItems = [...editableItems]
    const newRow = {
      name: '',
      amount: "0.00",
      taxCode: null,
      splitState: defaultSplitState
    }
    // Si index est -1, ajouter au début, sinon après l'index spécifié
    const insertIndex = index === -1 ? 0 : index + 1
    updatedItems.splice(insertIndex, 0, newRow)
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)

    // Mettre en surbrillance la ligne nouvellement ajoutée
    setNewlyAddedIndex(insertIndex)
  }

  // Gestionnaire de suppression de ligne avec compte à rebours intégré
  const handleDeleteRow = (index) => {
    if (editableItems.length <= 1) return // Garde au moins une ligne

    const itemToDelete = editableItems[index]
    const itemName = itemToDelete.name || `Article ${index + 1}`

    // Annuler toute suppression en attente pour cet index
    if (pendingDeletions.has(index)) {
      clearTimeout(pendingDeletions.get(index).timeoutId)
      setPendingDeletions(prev => {
        const newMap = new Map(prev)
        newMap.delete(index)
        return newMap
      })
    }

    // Supprimer immédiatement visuellement
    const updatedItems = editableItems.filter((_, i) => i !== index)
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)

    // Programmer la suppression définitive après 5 secondes
    const timeoutId = setTimeout(() => {
      setPendingDeletions(prev => {
        const newMap = new Map(prev)
        newMap.delete(index)
        return newMap
      })
    }, 5000)

    // Stocker l'état de suppression en attente
    setPendingDeletions(prev => new Map(prev).set(index, {
      item: itemToDelete,
      originalIndex: index,
      timeoutId: timeoutId,
      itemName: itemName,
      timeLeft: 5
    }))

    // Démarrer le compte à rebours
    startCountdown(index, 5)
  }

  // Fonction pour gérer le compte à rebours
  const startCountdown = (index, timeLeft) => {
    if (timeLeft <= 0) return

    setTimeout(() => {
      setPendingDeletions(prev => {
        const newMap = new Map(prev)
        if (newMap.has(index)) {
          const item = newMap.get(index)
          if (timeLeft > 1) {
            newMap.set(index, { ...item, timeLeft: timeLeft - 1 })
            startCountdown(index, timeLeft - 1)
          } else {
            newMap.delete(index)
          }
        }
        return newMap
      })
    }, 1000)
  }

  // Gestionnaire d'annulation de suppression
  const handleUndoDelete = (originalIndex) => {
    const pendingItem = pendingDeletions.get(originalIndex)
    if (!pendingItem) return

    // Annuler le timeout
    clearTimeout(pendingItem.timeoutId)

    // Restaurer l'article supprimé
    const updatedItems = [...editableItems]
    updatedItems.splice(originalIndex, 0, pendingItem.item)
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)

    // Nettoyer l'état
    setPendingDeletions(prev => {
      const newMap = new Map(prev)
      newMap.delete(originalIndex)
      return newMap
    })

    // Notification de succès
    toast({
      title: "Suppression annulée",
      description: `${pendingItem.itemName} a été restauré.`,
      duration: 2000,
    })
  }

  // Calcul des totaux avec répartition dynamique
  const totals = editableItems.reduce((acc, item) => {
    const taxes = calculateItemTaxes(item);
    const itemTotal = taxes.total;

    // Liste unique des groupes pour éviter les doublons
    const groupsForTotals = Array.from(new Set([...splitConfig.map(g => g.id), 'commun'])).map(id => ({ id }));

    // Initialiser les totaux pour chaque groupe s'ils n'existent pas
    groupsForTotals.forEach(group => {
      if (!(group.id + 'Total' in acc)) {
        acc[group.id + 'Total'] = 0;
      }
    });

    // Calcul de la répartition selon l'état du tri-state checkbox
    groupsForTotals.forEach(group => {
      if (item.splitState === group.id) {
        acc[group.id + 'Total'] += itemTotal;
      }
    });

    return {
      ...acc,
      subtotal: acc.subtotal + (parseFloat(item.amount) || 0),
      gst: acc.gst + taxes.gst,
      qst: acc.qst + taxes.qst,
      total: acc.total + itemTotal,
    };
  }, { subtotal: 0, gst: 0, qst: 0, total: 0 });

  // Formatage du montant en dollars canadiens (toujours 2 décimales)
  const formatAmount = (amount) => `${Number(amount).toFixed(2)} $`

  // Liste des groupes pour l'affichage des totaux (Commun en premier)
  const displayGroups = [{ id: 'commun', name: 'Commun' }, ...splitConfig.filter(g => g.id !== 'commun')]

  return (
    <div className="space-y-2">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Article</TableHead>
              <TableHead className="text-right text-xs">Montant de base</TableHead>
              <TableHead className="text-center text-xs">Taxes</TableHead>
              <TableHead className="text-right text-xs">Total</TableHead>
              <TableHead className="text-center text-xs">Répartition</TableHead>
              <TableHead className="text-center text-xs w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
        {loading ? (
          // État de chargement - skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell className="py-2">
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableCell>
              <TableCell className="text-center py-2">
                <Skeleton className="h-6 w-12 mx-auto rounded-full" />
              </TableCell>
              <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableCell>
              <TableCell className="text-center py-2">
                <Skeleton className="h-6 w-8 mx-auto rounded" />
              </TableCell>
            </TableRow>
          ))
        ) : items.length === 0 ? (
          // État vide - aucun article
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              Aucun article dans la facture
            </TableCell>
          </TableRow>
        ) : (
          // Affichage des articles avec boutons d'ajout entre les lignes
          editableItems.map((item, index) => {
            const taxes = calculateItemTaxes(item);
            const isPendingDeletion = pendingDeletions.has(index);

            return (
              <React.Fragment key={index}>
                {/* Bouton d'ajout avant la première ligne */}
                {index === 0 && (
                  <TableRow className="border-0">
                    <TableCell colSpan={7} className="text-center py-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddRow(-1)}
                        className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600 text-xs"
                      >
                        +
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {/* Ligne de suppression en attente */}
                {isPendingDeletion ? (
                  <TableRow className="bg-red-50 border-red-200">
                    <TableCell colSpan={6} className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-red-600 font-medium">
                            Article supprimé: {pendingDeletions.get(index).itemName}
                          </div>
                          <div className="text-sm text-red-500">
                            Suppression définitive dans {pendingDeletions.get(index).timeLeft}s
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUndoDelete(index)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Annuler
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xs text-red-600 font-bold">
                          {pendingDeletions.get(index).timeLeft}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  /* Ligne de données normale */
                  <TableRow className={index === newlyAddedIndex ? 'bg-green-50 border-green-200 animate-pulse' : ''}>
                    <TableCell className="py-2">
                      <Input
                        value={item.name || ''}
                        onChange={(e) => {
                          const updatedItems = [...editableItems]
                          updatedItems[index].name = e.target.value
                          setEditableItems(updatedItems)
                          if (onItemsChange) onItemsChange(updatedItems)
                        }}
                        className="border-0 p-0 h-auto bg-transparent focus:bg-white text-sm"
                        placeholder="Nom de l'article"
                      />
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.amount || ''}
                        onChange={(e) => handleAmountChange(index, e.target.value)}
                        onBlur={() => handleAmountBlur(index)}
                        className="w-20 text-right border-0 p-0 h-auto bg-transparent focus:bg-white text-sm"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <Select
                        value={item.taxCode || 'rien'}
                        onValueChange={(value) => handleTaxCodeChange(index, value)}
                      >
                        <SelectTrigger className="w-20 h-8 border-0 bg-transparent focus:bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rien">-</SelectItem>
                          <SelectItem value="F">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              F
                            </span>
                          </SelectItem>
                          <SelectItem value="P">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              P
                            </span>
                          </SelectItem>
                          <SelectItem value="FP">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              FP
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-medium py-2 text-sm">
                      {formatAmount(taxes.total)}
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <TriStateCheckbox
                        value={item.splitState}
                        onChange={(newState) => handleSplitStateChange(index, newState)}
                        splitConfig={splitConfig}
                      />
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleAddRow(index)}
                            className="text-green-600"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            + Au dessus
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAddRow(index + 1)}
                            className="text-green-600"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            + En dessous
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRow(index)}
                            disabled={editableItems.length <= 1}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )}

                {/* Bouton d'ajout entre les lignes (compact) - seulement si pas en suppression */}
                {!isPendingDeletion && (
                  <TableRow className="border-0">
                    <TableCell colSpan={7} className="text-center py-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddRow(index)}
                        className="h-4 w-4 p-0 text-gray-400 hover:text-blue-600 text-xs"
                      >
                        +
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })
        )}
      </TableBody>
      {!loading && editableItems.length > 0 && (
        <TableFooter>
          <TableRow>
            <TableCell className="font-medium">Sous-total</TableCell>
            <TableCell className="text-right font-medium" colSpan={3}>
              {formatAmount(totals.subtotal)}
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">GST (5%)</TableCell>
            <TableCell className="text-right font-medium" colSpan={3}>
              {formatAmount(totals.gst)}
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">QST (9.975%)</TableCell>
            <TableCell className="text-right font-medium" colSpan={3}>
              {formatAmount(totals.qst)}
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
         {/* Lignes de totaux pour Commun + chaque groupe configuré */}
         {displayGroups.map((group) => {
           const totalKey = group.id + 'Total';
           const totalAmount = totals[totalKey] || 0;

           // Couleur dynamique basée sur la configuration
           let colorClass = 'bg-gray-50 text-gray-800';
           if (group.id === 'commun') {
             colorClass = 'bg-blue-50 text-blue-800';
           } else {
             colorClass = getGroupLightColor(group.colors);
           }

           return (
             <TableRow key={group.id} className={colorClass}>
               <TableCell className="font-bold">{group.name}</TableCell>
               <TableCell className="text-right font-bold" colSpan={3}>
                 {formatAmount(totalAmount)}
               </TableCell>
               <TableCell colSpan={2}></TableCell>
             </TableRow>
           );
         })}
          <TableRow className="border-t-2">
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold" colSpan={3}>
              {formatAmount(totals.total)}
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        </TableFooter>
      )}
      {loading && (
        <TableFooter>
          <TableRow>
            <TableCell className="font-medium">
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell className="text-right font-medium" colSpan={3}>
              <Skeleton className="h-4 w-16 ml-auto" />
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">
              <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="text-right font-medium" colSpan={3}>
              <Skeleton className="h-4 w-16 ml-auto" />
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
          <TableRow className="bg-yellow-50">
            <TableCell className="font-bold">
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell className="text-right font-bold" colSpan={3}>
              <Skeleton className="h-4 w-16 ml-auto" />
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
          <TableRow className="bg-pink-50">
            <TableCell className="font-bold">
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell className="text-right font-bold" colSpan={3}>
              <Skeleton className="h-4 w-16 ml-auto" />
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
          <TableRow className="bg-blue-50">
            <TableCell className="font-bold">
              <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="text-right font-bold" colSpan={3}>
              <Skeleton className="h-4 w-16 ml-auto" />
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
          <TableRow className="border-t-2">
            <TableCell className="font-bold">
              <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="text-right font-bold" colSpan={3}>
              <Skeleton className="h-4 w-16 ml-auto" />
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        </TableFooter>
      )}
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          // Mobile loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="bg-white border rounded-lg p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Aucun article dans la facture
          </div>
        ) : (
          editableItems.map((item, index) => {
            const taxes = calculateItemTaxes(item);
            const isPendingDeletion = pendingDeletions.has(index);

            return (
              <div
                key={`mobile-${index}`}
                className={`bg-white border rounded-lg p-4 space-y-3 ${
                  index === newlyAddedIndex ? 'bg-green-50 border-green-200 animate-pulse' :
                  isPendingDeletion ? 'bg-red-50 border-red-200' : ''
                }`}
              >
                {isPendingDeletion ? (
                  /* Contenu de suppression en attente */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-red-600 font-medium">
                          Article supprimé: {pendingDeletions.get(index).itemName}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-sm text-red-600 font-bold">
                            {pendingDeletions.get(index).timeLeft}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUndoDelete(index)}
                        className="text-red-600 border-red-300 hover:bg-red-50 h-8 px-3"
                      >
                        Annuler
                      </Button>
                    </div>
                    <div className="text-sm text-red-500 text-center">
                      Suppression définitive dans {pendingDeletions.get(index).timeLeft} seconde{pendingDeletions.get(index).timeLeft > 1 ? 's' : ''}
                    </div>
                  </div>
                ) : (
                  /* Contenu normal de la carte */
                  <>
                    {/* Article Name */}
                    <Input
                      value={item.name || ''}
                      onChange={(e) => {
                        const updatedItems = [...editableItems]
                        updatedItems[index].name = e.target.value
                        setEditableItems(updatedItems)
                        if (onItemsChange) onItemsChange(updatedItems)
                      }}
                      className="text-base font-medium border-0 p-0 h-auto bg-transparent focus:bg-gray-50"
                      placeholder="Nom de l'article"
                    />

                    {/* Amount and Total Row */}
                    <div className="flex justify-between items-end">
                      <div className="flex-1 mr-4">
                        <label className="text-xs text-gray-500 block mb-1">Montant de base</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.amount || ''}
                          onChange={(e) => handleAmountChange(index, e.target.value)}
                          onBlur={() => handleAmountBlur(index)}
                          className="w-full text-right text-base h-10"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="text-right min-w-0">
                        <label className="text-xs text-gray-500 block mb-1">Total</label>
                        <div className="text-lg font-bold text-green-600">
                          {formatAmount(taxes.total)}
                        </div>
                      </div>
                    </div>

                    {/* Tax Code and Split Row */}
                    <div className="flex justify-between items-end">
                      <div className="flex-1 mr-4">
                        <label className="text-xs text-gray-500 block mb-1">Taxes</label>
                        <Select
                          value={item.taxCode || 'rien'}
                          onValueChange={(value) => handleTaxCodeChange(index, value)}
                        >
                          <SelectTrigger className="w-full h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rien">-</SelectItem>
                            <SelectItem value="F">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                F (GST 5%)
                              </span>
                            </SelectItem>
                            <SelectItem value="P">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                P (QST 9.975%)
                              </span>
                            </SelectItem>
                            <SelectItem value="FP">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                FP (GST + QST)
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="min-w-0">
                        <label className="text-xs text-gray-500 block mb-1">Répartition</label>
                        <TriStateCheckbox
                          value={item.splitState}
                          onChange={(newState) => handleSplitStateChange(index, newState)}
                          splitConfig={splitConfig}
                        />
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddRow(index)}
                        className="text-green-600 h-8 px-3"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRow(index)}
                        disabled={editableItems.length <= 1}
                        className="text-red-600 h-8 px-3"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}

        {/* Mobile Totals */}
        {!loading && editableItems.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Sous-total</span>
              <span className="font-medium">{formatAmount(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">GST (5%)</span>
              <span className="font-medium">{formatAmount(totals.gst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">QST (9.975%)</span>
              <span className="font-medium">{formatAmount(totals.qst)}</span>
            </div>
            {displayGroups.map((group) => {
              const totalKey = group.id + 'Total';
              const totalAmount = totals[totalKey] || 0;

              // Couleur dynamique basée sur la configuration (même logique que desktop)
              let colorClass = 'bg-gray-50 text-gray-800';
              if (group.id === 'commun') {
                colorClass = 'bg-blue-50 text-blue-800';
              } else {
                colorClass = getGroupLightColor(group.colors);
              }

              return (
                <div key={`mobile-${group.id}`} className={`flex justify-between font-bold rounded px-2 py-1 ${colorClass}`}>
                  <span>{group.name}</span>
                  <span>{formatAmount(totalAmount)}</span>
                </div>
              );
            })}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatAmount(totals.total)}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default InvoiceTable