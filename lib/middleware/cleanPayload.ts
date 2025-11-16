/**
 * Middleware function to clean payload data for frontend display.
 *
 * This function processes the payload JSON to extract all keys and values,
 * with special handling for the 'results' array to preserve content while
 * excluding image_url and timestamp keys from result objects.
 *
 * @param payload - The raw payload JSON object
 * @returns A cleaned payload with results array containing objects with url and content
 *
 * @example
 * ```typescript
 * const cleaned = cleanPayload(rawPayload);
 * // Results array will contain objects with url and content preserved
 * // image_url and timestamp keys are excluded from the results
 * ```
 */

// Type definitions for the payload structure
interface ResultItem {
  url: string;
  [key: string]: unknown;
}

interface ValyuSearchNode {
  query?: string;
  timestamp?: string;
  request_params?: Record<string, unknown>;
  results?: ResultItem[] | string[];
  raw?: {
    results?: ResultItem[] | string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CompletedNodes {
  valyu_search?: ValyuSearchNode;
  [key: string]: unknown;
}

interface Payload {
  session_id?: string;
  completed_nodes?: CompletedNodes;
  next_node?: string;
  is_complete?: boolean;
  pipeline_graph?: Record<string, unknown>;
  redteam_enabled?: boolean;
  redteam_loops?: number;
  [key: string]: unknown;
}

/**
 * Deep clones an object to avoid mutating the original
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Cleans the payload by preserving content in result objects while excluding image_url and timestamp
 *
 * @param payload - The raw payload JSON object
 * @returns A cleaned payload with results array containing objects with url and content preserved
 */
export function cleanPayload(payload: Payload): Payload {
  // Deep clone to avoid mutating the original payload
  const cleaned = deepClone(payload);

  // Navigate to the specific path: completed_nodes.valyu_search.results
  const valyuSearch = cleaned?.completed_nodes?.valyu_search;

  if (valyuSearch && Array.isArray(valyuSearch.results)) {
    // Clean result objects: preserve content, exclude image_url and timestamp
    // Handle both cases: if results are already strings, keep them; if objects, clean them
    valyuSearch.results = valyuSearch.results
      .map((result) => {
        // If already a string, return it
        if (typeof result === "string") {
          return result;
        }
        // Clean object: preserve content, exclude image_url and timestamp
        if (result && typeof result === "object" && "url" in result) {
          const { image_url, timestamp, ...cleanedResult } = result as Record<
            string,
            unknown
          >;
          return cleanedResult;
        }
        return result;
      })
      .filter((result) => {
        // Filter out null/undefined results
        if (!result) return false;
        // If it's a string, keep it if it's a valid URL
        if (typeof result === "string") {
          return result.startsWith("http");
        }
        // If it's an object, keep it if it has a url property
        return typeof result === "object" && "url" in result;
      }) as ResultItem[] | string[];
  }

  // Also handle the raw.results path if it exists
  if (valyuSearch?.raw && Array.isArray(valyuSearch.raw.results)) {
    valyuSearch.raw.results = valyuSearch.raw.results
      .map((result) => {
        // If already a string, return it
        if (typeof result === "string") {
          return result;
        }
        // Clean object: preserve content, exclude image_url and timestamp
        if (result && typeof result === "object" && "url" in result) {
          const { image_url, timestamp, ...cleanedResult } = result as Record<
            string,
            unknown
          >;
          return cleanedResult;
        }
        return result;
      })
      .filter((result) => {
        // Filter out null/undefined results
        if (!result) return false;
        // If it's a string, keep it if it's a valid URL
        if (typeof result === "string") {
          return result.startsWith("http");
        }
        // If it's an object, keep it if it has a url property
        return typeof result === "object" && "url" in result;
      }) as ResultItem[] | string[];
  }

  return cleaned;
}
