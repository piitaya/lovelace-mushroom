export function mediaSourceIcon(source: string): string | undefined {
	switch (source.toLowerCase()) {
		case "bt":
		case "bluetooth":
			return "mdi:bluetooth-audio";
		case "cd":
		case "disc":
		case "dvd":
			return "mdi:disc";
		case "netflix":
			return "mdi:netflix";
		case "spotify":
			return "mdi:spotify";
		case "youtube":
			return "mdi:youtube";
		default:
			return undefined;
	}
}
