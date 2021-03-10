export function domainEqual(a: Record<string, any>, b: Record<string, any>) {
	for (const key in a) {
		if (key in b) {
			continue
		} else {
			return false
		}
	}
	for (const key in b) {
		if (key in a) {
			continue
		} else {
			return false
		}
	}
	return true
}
