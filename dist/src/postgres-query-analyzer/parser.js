"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSql = parseSql;
exports.safeParseSql = safeParseSql;
const postgres_1 = require("@wsporto/typesql-parser/postgres");
const traverse_1 = require("./traverse");
const neverthrow_1 = require("neverthrow");
function parseSql(sql, dbSchema, checkConstraints, userFunctions, options = (0, traverse_1.defaultOptions)()) {
    const parser = (0, postgres_1.parseSql)(sql);
    const traverseResult = (0, traverse_1.traverseSmt)(parser.stmt(), dbSchema, checkConstraints, userFunctions, options);
    return Object.assign(Object.assign({}, traverseResult), { columns: traverseResult.columns.map((_a) => {
            var { column_key: _ } = _a, rest = __rest(_a, ["column_key"]);
            return rest;
        }) });
}
function safeParseSql(sql, dbSchema, checkConstraints, userFunctions, options = (0, traverse_1.defaultOptions)()) {
    try {
        const result = parseSql(sql, dbSchema, checkConstraints, userFunctions, options);
        return (0, neverthrow_1.ok)(result);
    }
    catch (e) {
        const error = e;
        return (0, neverthrow_1.err)(error.message);
    }
}
//# sourceMappingURL=parser.js.map