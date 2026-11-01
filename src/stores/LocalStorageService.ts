import { App } from "obsidian";
class LocalStorageService {
 private app!: App;
 init(app: App) { this.app = app; }
 save<T>(key: string, value: T) { this.app.saveLocalStorage(key, JSON.stringify(value)); }
 load<T>(key: string): T | null {
  const value = this.app.loadLocalStorage(key);
  if (typeof value !== "string" || !value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
 }
}
export const localStorageService = new LocalStorageService();
