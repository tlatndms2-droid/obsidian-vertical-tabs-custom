import { WorkspaceLeaf } from "obsidian";
import { DEFAULT_GROUP_TITLE } from "./GroupNames";

export type GroupTabDisplay = { title: string; icon: string; favicon?: string };

function websiteLabel(url: URL) {
	const host = url.hostname.replace(/^www\./, "");
	if (host === "chatgpt.com" || host === "chat.openai.com") return "ChatGPT";
	if (host === "naver.com" || host.endsWith(".naver.com")) return "Naver";
	if (host === "chromewebstore.google.com") return "Chrome Web Store";
	if (host === "google.com" && /^\/chrome(?:\/|$)/.test(url.pathname)) return "Chrome";
	return host;
}

export function groupTabDisplay(leaf?: WorkspaceLeaf): GroupTabDisplay {
	const view = leaf?.view;
	const type = view?.getViewType();
	if (!leaf || !view || type === "empty") return { title: DEFAULT_GROUP_TITLE, icon: "copy" };

	const title = view.getDisplayText().trim() || DEFAULT_GROUP_TITLE;
	if (type === "markdown") return { title, icon: "file-text" };
	if (type === "canvas") return { title, icon: "workflow" };
	if (type !== "webviewer") return { title, icon: "copy" };

	const state = view.getState() as { url?: string };
	const url = state.url && URL.canParse(state.url) ? new URL(state.url) : undefined;
	const site = url && /^https?:$/.test(url.protocol) ? websiteLabel(url) : "";
	const favicon = site ? leaf.tabHeaderInnerIconEl?.querySelector<HTMLImageElement>(".webviewer-favicon-container img")?.src : undefined;
	return {
		title: site && site.toLowerCase() !== title.toLowerCase() ? `${site} - ${title}` : title,
		icon: "globe-2",
		favicon,
	};
}
