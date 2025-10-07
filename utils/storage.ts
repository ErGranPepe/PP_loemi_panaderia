/**
 * Utilidades para interactuar de forma segura con localStorage.
 * Previene que la aplicación se rompa si localStorage no está disponible
 * o si los datos almacenados están corruptos.
 */

export function safeSetLocalStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[SafeStorage] No se pudo guardar en localStorage ('${key}'):`, error);
  }
}

export function safeGetLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null || storedValue === 'undefined') {
      return defaultValue;
    }
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.warn(`[SafeStorage] No se pudo leer de localStorage ('${key}'):`, error);
    // Si hay un error de parseo, devolvemos el valor por defecto para evitar crashes.
    return defaultValue;
  }
}