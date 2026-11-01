import { WorkspaceLeaf } from "obsidian";
declare module "obsidian" {
 interface WorkspaceParent {
  children: WorkspaceLeaf[];
  currentTab: number;
 }
}
