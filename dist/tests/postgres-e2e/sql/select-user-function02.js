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
exports.selectUserFunction02 = selectUserFunction02;
function selectUserFunction02(client, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	SELECT * FROM get_mytable1_by_id($1)
	`;
        return client.query({ text: sql, rowMode: 'array', values: [params.id] })
            .then(res => res.rows.length > 0 ? mapArrayToSelectUserFunction02Result(res.rows[0]) : null);
    });
}
function mapArrayToSelectUserFunction02Result(data) {
    const result = {
        id: data[0],
        value: data[1]
    };
    return result;
}
//# sourceMappingURL=select-user-function02.js.map