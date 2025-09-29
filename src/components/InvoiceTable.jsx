/**
 * Composant de tableau de facture - Tableau éditable d'articles avec calcul du total, taxes et répartition
 *
 * Fonctionnalités métier :
 * - Affichage d'une liste d'articles avec noms, montants de base et taxes
 * - Édition en ligne des montants et codes de taxes
 * - Calcul automatique des taxes GST (5%) et QST (9.975%) du Québec
 * - Support des codes de taxes (FP, F, P) selon les normes québécoises
 * - Répartition automatique entre FCN et KGB (50/50, 100% ou exclusif)
 * - Calcul automatique du montant total incluant les taxes
 * - Gestion de l'état vide (aucun article)
 * - Interface en français avec montants en dollars canadiens
 *
 * Objectif : Fournir un tableau complet et professionnel
 * pour visualiser et modifier les éléments d'une facture avec calcul précis des taxes et répartition.
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
import CustomToastWithProgress from "./CustomToastWithProgress"

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

  // État pour les suppressions en attente
  const [pendingDeletion, setPendingDeletion] = useState(null)

  // État pour le toast personnalisé
  const [showCustomToast, setShowCustomToast] = useState(false)
  const [toastData, setToastData] = useState(null)

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
  }

  // Gestionnaire de suppression de ligne avec undo
  const handleDeleteRow = (index) => {
    if (editableItems.length <= 1) return // Garde au moins une ligne

    const itemToDelete = editableItems[index]
    const itemName = itemToDelete.name || `Article ${index + 1}`

    // Annuler toute suppression en attente
    if (pendingDeletion?.timeoutId) {
      clearTimeout(pendingDeletion.timeoutId)
    }

    // Supprimer immédiatement visuellement
    const updatedItems = editableItems.filter((_, i) => i !== index)
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)

    // Programmer la suppression définitive après 5 secondes
    const timeoutId = setTimeout(() => {
      setPendingDeletion(null)
      setShowCustomToast(false)
      setToastData(null)
    }, 5000)

    // Stocker l'état de suppression en attente
    setPendingDeletion({
      item: itemToDelete,
      index: index,
      timeoutId: timeoutId,
      itemName: itemName
    })

    // Afficher le toast personnalisé avec barre de progression
    setToastData({
      title: "Article supprimé",
      description: `${itemName} - ${itemToDelete.amount ? Number(itemToDelete.amount).toFixed(2) + ' $' : 'Montant non défini'}`,
      actionLabel: "Annuler",
      onAction: () => handleUndoDelete(),
      onTimeout: () => {
        setPendingDeletion(null)
        setShowCustomToast(false)
        setToastData(null)
      }
    })
    setShowCustomToast(true)
  }

  // Gestionnaire d'annulation de suppression
  const handleUndoDelete = () => {
    if (!pendingDeletion) return

    // Annuler le timeout
    clearTimeout(pendingDeletion.timeoutId)

    // Restaurer l'article supprimé
    const updatedItems = [...editableItems]
    updatedItems.splice(pendingDeletion.index, 0, pendingDeletion.item)
    setEditableItems(updatedItems)
    if (onItemsChange) onItemsChange(updatedItems)

    // Nettoyer l'état et masquer le toast
    setPendingDeletion(null)
    setShowCustomToast(false)
    setToastData(null)

    // Notification de succès
    toast({
      title: "Suppression annulée",
      description: `${pendingDeletion.itemName} a été restauré.`,
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

                {/* Ligne de données */}
                <TableRow>
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

                {/* Bouton d'ajout entre les lignes (compact) */}
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

      {/* Toast personnalisé avec barre de progression */}
      {showCustomToast && toastData && (
        <CustomToastWithProgress
          title={toastData.title}
          description={toastData.description}
          onAction={toastData.onAction}
          actionLabel={toastData.actionLabel}
          duration={5000}
          onTimeout={toastData.onTimeout}
        />
      )}
    </div>
  )
}

export default InvoiceTable