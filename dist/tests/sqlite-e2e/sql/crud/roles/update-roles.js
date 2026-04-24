"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoles = updateRoles;
function updateRoles(db, data, params) {
    const keys = Object.keys(data);
    const columns = keys.filter(key => data[key] !== undefined);
    const values = columns.map(col => data[col]).concat(params.id);
    const sql = `
	UPDATE roles
	SET ${columns.map(col => `${col} = ?`).join(', ')}
	WHERE id = ?`;
    return db.prepare(sql)
        .run(values);
}
//# sourceMappingURL=update-roles.js.map