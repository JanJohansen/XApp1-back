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
				if (!(prop in dest)) dest[prop] = {}
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

export function generateBase64Uuid(): string {
	const randomBytes = new Uint8Array(12);
	crypto.getRandomValues(randomBytes);
	const base64String = "~" + btoa(String.fromCharCode.apply(null, randomBytes));
	console.log(base64String); // prints a random 128-bit base64-encoded string
	return base64String
}
