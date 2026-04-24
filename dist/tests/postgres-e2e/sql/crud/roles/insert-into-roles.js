"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertIntoRoles = insertIntoRoles;
function insertIntoRoles(client, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const insertColumns = ['role', 'fk_user'];
        const columns = [];
        const placeholders = [];
        const values = [];
        let parameterNumber = 1;
        for (const column of insertColumns) {
            const value = params[column];
            if (value !== undefined) {
                columns.push(column);
                placeholders.push(`$${parameterNumber++}`);
                values.push(value);
            }
        }
        const sql = columns.length === 0
            ? `INSERT INTO roles DEFAULT VALUES RETURNING *`
            : `INSERT INTO roles (${columns.join(', ')})
	VALUES(${placeholders.join(', ')})
	RETURNING *`;
        return client.query({ text: sql, values })
            .then(res => { var _a; return (_a = res.rows[0]) !== null && _a !== void 0 ? _a : null; });
    });
}
//# sourceMappingURL=insert-into-roles.js.map