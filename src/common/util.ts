export function patch(src: any, dest: any): object {
	for (let prop in src) {
		if (src[prop] == null) delete dest[prop]
		else {
			if (typeof src[prop] == "object") {
				if (!(prop in dest)) dest[prop] = {}
				patch(src[prop], dest[prop])
			} else {
				dest[prop] = src[prop]
			}
		}
	}
	return dest
}
