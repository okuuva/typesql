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
exports.selectFromRoles = selectFromRoles;
function selectFromRoles(client, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	SELECT
		id,
		role,
		fk_user
	FROM roles
	WHERE id = $1
	`;
        return client.query({ text: sql, rowMode: 'array', values: [params.id] })
            .then(res => res.rows.length > 0 ? mapArrayToSelectFromRolesResult(res.rows[0]) : null);
    });
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