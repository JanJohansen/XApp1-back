//
// NOTE TO SELF: Files are copied from back/common --> front/common (using cpx in dev script)
//

/**
 * Patch dest object w. values from src.
 * Create or delete object structure (in dest) if not there.
 * Write value if same or different!
 * @param src
 * @param dest
 * @returns true if anything was patched
 */
export function patch(src: any, dest: any, options = { setIfSame: true }): boolean {
	let patched = false
	for (let prop in src) {
		if (src[prop] == null) delete dest[prop]
		else {
			// if(typeof(dest) != "object") dest = {}	// Overwrite dest if not already an object!
			if (Array.isArray(src[prop])) {
				dest[prop] = src[prop] // Overwrite array
			} else if (typeof src[prop] == "object") {
				if (!(prop in dest)) {
					dest[prop] = {}
					patched = true
				}
				patched = patch(src[prop], dest[prop], options) || patched
			} else {
				if (options.setIfSame) {
					dest[prop] = src[prop]
					patched = true
				} else if (dest[prop] != src[prop]) {
					dest[prop] = src[prop] // else dont set since values are the same!
					patched = true
				}
			}
		}
	}
	return patched
}

export function generateUid(): string {
	let id = ""
	const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const numChars = characters.length
	const idLength = 16
	for (var i = 0; i < idLength; i++) {
		id += characters.charAt(Math.floor(Math.random() * numChars))
	}
	return id 
}
