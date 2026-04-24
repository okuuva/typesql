"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLibSqlClient = createLibSqlClient;
const neverthrow_1 = require("neverthrow");
const libsql_1 = __importDefault(require("libsql"));
function createLibSqlClient(url, attachList, loadExtensions, authToken) {
    const opts = {
        authToken: authToken
    };
    const db = new libsql_1.default(url, opts);
    for (const attach of attachList) {
        db.exec(`attach database ${attach}`);
    }
    for (const extension of loadExtensions) {
        db.loadExtension(extension);
    }
    return (0, neverthrow_1.ok)({
        type: 'libsql',
        client: db
    });
}
//# sourceMappingURL=libsql.js.map