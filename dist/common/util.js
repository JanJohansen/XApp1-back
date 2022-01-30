"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patch = void 0;
function patch(src, dest) {
    for (let prop in src) {
        if (src[prop] == null)
            delete dest[prop];
        else {
            if (typeof src[prop] == "object") {
                if (!(prop in dest))
                    dest[prop] = {};
                patch(src[prop], dest[prop]);
            }
            else {
                dest[prop] = src[prop];
            }
        }
    }
    return dest;
}
exports.patch = patch;
