import { localStorageService } from "../stores/LocalStorageService";
export const DEFAULT_GROUP_TITLE = "Grouped tabs";
const KEY = "vertical-tabs-custom:view-state";
export const groupNames = {
 titles: new Map<string, string>(),
 load() {
  const entries = localStorageService.load<unknown>(KEY);
  this.titles = new Map(Array.isArray(entries) ? entries.filter((entry): entry is [string,string] => Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string") : []);
 },
 get(id: string) { return this.titles.get(id); },
 set(id: string, name: string) { this.titles.set(id,name); localStorageService.save(KEY, [...this.titles]); }
};
