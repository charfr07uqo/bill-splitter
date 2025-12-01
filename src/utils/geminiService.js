/**
 * Service Gemini pour le traitement des images de factures
 *
 * Fonctionnalités métier :
 * - Traitement d'images de factures via l'API Gemini
 * - Extraction des noms d'articles et montants
 * - Retour d'un tableau d'objets structuré
 *
 * Objectif : Automatiser l'extraction des données de factures
 * à partir d'images pour faciliter la saisie manuelle.
 *
 * @created 2025-09-28
 * @author Équipe Développement
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Traite une image de facture via Gemini pour extraire les articles et montants
 * @param {string} apiKey - Clé API Google Generative AI
 * @param {File} file - Objet File de l'image de facture
 * @param {string} modelName - Nom du modèle Gemini à utiliser
 * @param {string} customPrompt - Prompt personnalisé (optionnel)
 * @param {Array} splitConfig - Configuration des répartitions (optionnel)
 * @returns {Promise<Array<{name: string, amount: number}>>} Tableau d'objets avec nom et montant
 */
export async function processInvoiceImage(apiKey, file, modelName = 'gemini-2.5-flash', customPrompt = null, splitConfig = null) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Générer la partie sur les couleurs basée sur la configuration
    let colorInstructions = 'Normal/unhighlighted = commun (shared)'
    if (splitConfig) {
      const colorMappings = splitConfig
        .filter(group => group.colors && group.colors.length > 0)
        .map(group => {
          const colorNames = group.colors.map(colorValue => {
            // Mapper les valeurs de couleur aux noms lisibles
            const colorMap = {
              'red': 'rouge',
              'pink': 'rose',
              'orange': 'orange',
              'yellow': 'jaune',
              'green': 'vert',
              'lime': 'vert clair',
              'cyan': 'cyan',
              'blue': 'bleu',
              'purple': 'violet',
              'violet': 'violet foncé'
            }
            return colorMap[colorValue] || colorValue
          }).join(' ou ')

          return `${colorNames} = ${group.id} (appartient à ${group.name})`
        })

      if (colorMappings.length > 0) {
        colorInstructions = colorMappings.join('\n- ') + '\n- Normal/unhighlighted = commun (shared)'
      }
    }

    const prompt = customPrompt || `Extract item names and amounts from this invoice/receipt image. Look for tax indicators at the end of lines (G or H) which indicate applicable taxes in Ontario, Canada:

- G = Federal GST (5%) tax applies
- H = Harmonized HST (13%) tax applies

Important: If an amount ends with a '-' character (like "5.00-"), it represents a discount and should be negative (e.g., "5.00-" becomes -5.00).

Also detect if any lines or amounts are highlighted with colors:
- ${colorInstructions}

Return as a JSON array of objects with these properties:
- name: string (item name)
- amount: number (price in dollars, negative for discounts)
- taxCode: string (G, H, or null if no tax indicator)
- splitState: string (based on highlighting)

Only return the JSON array, no other text or explanation.`;

    const imagePart = {
      inlineData: {
        data: await fileToBase64(file),
        mimeType: file.type,
      },
    };

    // Log de la requête
    console.log('🔄 Requête Gemini:', {
      model: modelName,
      prompt: prompt,
      imageType: file.type,
      imageSize: file.size
    });

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Log de la réponse brute
    console.log('📥 Réponse brute de Gemini:', text);

    // Nettoyer la réponse pour extraire le JSON (gérer les blocs de code markdown)
    let jsonText = text.trim();

    // Supprimer les blocs de code markdown si présents
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Supprimer les espaces et sauts de ligne inutiles
    jsonText = jsonText.trim();

    console.log('🧹 Réponse nettoyée:', jsonText);

    // Analyser le JSON retourné
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError);
      console.error('📄 Texte qui a causé l\'erreur:', jsonText);

      // Essayer d'extraire du JSON d'une réponse plus complexe
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('🔍 Tentative d\'extraction de JSON avec regex...');
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (secondError) {
          throw new Error(`Impossible de parser la réponse JSON: ${secondError.message}`);
        }
      } else {
        throw new Error(`Réponse non-JSON reçue: ${jsonText.substring(0, 100)}...`);
      }
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Format de réponse invalide: attendu un tableau');
    }

    console.log('✅ JSON parsé avec succès (brut):', parsed);

    // Valider et convertir les données
    const processedItems = parsed.map(item => {
      if (!item.name || typeof item.amount === 'undefined') {
        throw new Error('Structure de données invalide dans la réponse');
      }
      return {
        name: String(item.name),
        amount: parseFloat(item.amount).toFixed(2), // Formater à 2 décimales
        taxCode: item.taxCode || null,
        splitState: item.splitState || 'commun' // État de répartition (commun par défaut)
      };
    });

    console.log('🔄 Données finales après traitement:', processedItems);
    return {
      processed: processedItems,
      raw: parsed
    };
  } catch (error) {
    throw new Error(`Échec du traitement de la facture: ${error.message}`);
  }
}

/**
 * Convertit un fichier en chaîne base64
 * @param {File} file - Objet File à convertir
 * @returns {Promise<string>} Chaîne base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Supprimer le préfixe data:image/...;base64,
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}