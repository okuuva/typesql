"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readNormalizedEOL = readNormalizedEOL;
const fs_1 = require("fs");
function readNormalizedEOL(path) {
    return (0, fs_1.readFileSync)(path, "utf8")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");
}
//# sourceMappingURL=test-utils.js.map