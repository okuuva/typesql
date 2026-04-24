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
exports.updateRoles = updateRoles;
function updateRoles(client, data, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateColumns = ['role', 'fk_user'];
        const updates = [];
        const values = [];
        let parameterNumber = 1;
        for (const column of updateColumns) {
            const value = data[column];
            if (value !== undefined) {
                updates.push(`${column} = $${parameterNumber++}`);
                values.push(value);
            }
        }
        if (updates.length === 0)
            return null;
        values.push(params.id);
        const sql = `UPDATE roles SET ${updates.join(', ')} WHERE id = $${parameterNumber} RETURNING *`;
        return client.query({ text: sql, values })
            .then(res => { var _a; return (_a = res.rows[0]) !== null && _a !== void 0 ? _a : null; });
    });
}
//# sourceMappingURL=update-roles.js.map