"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromRoles = deleteFromRoles;
function deleteFromRoles(db, params) {
    const sql = `DELETE
	FROM roles
	WHERE id = ?`;
    return db.prepare(sql)
        .run([params.id]);
}
//# sourceMappingURL=delete-from-roles.js.map