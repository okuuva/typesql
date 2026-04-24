"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectFromRoles = selectFromRoles;
function selectFromRoles(db, params) {
    const sql = `SELECT
		id,
		role,
		fk_user
	FROM roles
	WHERE id = ?`;
    return db.prepare(sql)
        .raw(true)
        .all([params.id])
        .map(data => mapArrayToSelectFromRolesResult(data))[0];
}
function mapArrayToSelectFromRolesResult(data) {
    const result = {
        id: data[0],
        role: data[1],
        fk_user: data[2]
    };
    return result;
}
//# sourceMappingURL=select-from-roles.js.map