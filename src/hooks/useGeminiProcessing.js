/**
 * Hook personnalisé pour le traitement des factures via Gemini
 *
 * Fonctionnalités métier :
 * - Gestion de l'état de traitement (chargement, erreur, données)
 * - Appel du service Gemini pour l'extraction des données
 * - Gestion des erreurs et validation des résultats
 *
 * Objectif : Fournir une interface réutilisable pour le traitement
 * asynchrone des images de factures avec gestion d'état.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import { useState, useCallback } from 'react';
import { processInvoiceImage } from '../utils/geminiService';

/**
 * Hook pour gérer le traitement des images de factures
 * @returns {Object} État et fonction de traitement
 */
export function useGeminiProcessing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [rawData, setRawData] = useState(null);

  /**
   * Traite une image de facture avec Gemini
   * @param {string} apiKey - Clé API Google Generative AI
   * @param {File} file - Objet File de l'image
   * @param {string} model - Modèle Gemini à utiliser
   * @param {string} customPrompt - Prompt personnalisé (optionnel)
   * @param {Array} splitConfig - Configuration des répartitions (optionnel)
   */
  const processInvoice = useCallback(async (apiKey, file, model = 'gemini-2.5-flash', customPrompt = null, splitConfig = null) => {
    setLoading(true);
    setError(null);
    setData(null);
    setRawData(null);

    try {
      const result = await processInvoiceImage(apiKey, file, model, customPrompt, splitConfig);
      const processedData = { items: result.processed };
      const rawData = result.raw;

      console.log('✅ Données traitées pour l\'UI:', processedData);
      console.log('🔍 Données brutes de Gemini:', rawData);

      setData(processedData);
      setRawData(rawData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    data,
    rawData,
    processInvoice
  };
}