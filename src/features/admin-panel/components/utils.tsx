// utilitaires partagés pour la normalization des données de domaine
export type NormalizedDomain = {
  // champ principal utilisé par la table
  name: string
  // informations additionnelles -> colonnes dynamiques
  extra_infos?: Record<string, any>
  // conserver les champs originaux si besoin
  [k: string]: any
}

/**
 * Retourne un tableau à partir d'une réponse qui peut être soit :
 * - un tableau (ancien format)
 * - un wrapper { data: [...] } (nouveau format)
 * - autre => []
 */
export function extractDataArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return payload.data
  }
  return []
}

/**
 * Normalise un item de domaine en forme { name: string, extra_infos?: Record<string, any> }
 * Accepte :
 * - ancien format : { name, extra_infos }
 * - nouveau format : { domain_name, domain_info } (domain_info peut être string JSON ou object)
 * - fallback : on tente d'extraire les champs les plus pertinents
 */
export function normalizeDomainItem(item: any): NormalizedDomain {
  if (item == null) return { name: '', extra_infos: {}, ...(item ?? {}) }

  // Si déjà au format "ancien"
  if ('name' in item || 'extra_infos' in item) {
    return {
      ...item,
      name: (item.name ?? '') as string,
      extra_infos: (item.extra_infos ?? {}) as Record<string, any>,
    }
  }

  // Si format nouveau : domain_name / domain_info
  if ('domain_name' in item || 'domain_info' in item) {
    let extra = item.domain_info ?? {}
    // domain_info peut être une string JSON
    if (typeof extra === 'string') {
      try {
        extra = JSON.parse(extra)
      } catch (e) {
        // garder la chaîne brute sous une clé pour affichage minimal
        extra = { domain_info: item.domain_info }
      }
    }

    const extra_infos: Record<string, any> = {}
    if (extra && typeof extra === 'object') {
      for (const [k, v] of Object.entries(extra)) {
        if (
          v == null ||
          typeof v === 'string' ||
          typeof v === 'number' ||
          typeof v === 'boolean'
        ) {
          extra_infos[k] = v
        } else {
          try {
            extra_infos[k] = JSON.stringify(v)
          } catch {
            extra_infos[k] = String(v)
          }
        }
      }
    }

    return {
      ...item,
      name: (item.domain_name ?? '') as string,
      extra_infos,
    }
  }

  return {
    ...item,
    name: (item.name ?? item.domain_name ?? '') as string,
    extra_infos: (item.extra_infos ?? item.domain_info ?? {}) as Record<
      string,
      any
    >,
  }
}

/**
 * Normalise un payload (array | { data: [...] }) en tableau d'objets normalisés
 */
export function normalizeDataArray(payload: any): NormalizedDomain[] {
  const arr = extractDataArray(payload)
  return arr.map(normalizeDomainItem)
}
