"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertIntoRoles = insertIntoRoles;
function insertIntoRoles(db, params) {
    const keys = Object.keys(params);
    const columns = keys.filter(key => params[key] !== undefined);
    const values = columns.map(col => params[col]);
    const sql = columns.length == 0
        ? `INSERT INTO roles DEFAULT VALUES`
        : `INSERT INTO roles(${columns.join(',')}) VALUES(${columns.map(_ => '?').join(',')})`;
    return db.prepare(sql)
        .run(values);
}
//# sourceMappingURL=insert-into-roles.js.map