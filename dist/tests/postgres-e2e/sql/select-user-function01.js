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
exports.selectUserFunction01 = selectUserFunction01;
function selectUserFunction01(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	SELECT * FROM get_mytable1()
	`;
        return client.query({ text: sql, rowMode: 'array' })
            .then(res => res.rows.map(row => mapArrayToSelectUserFunction01Result(row)));
    });
}
function mapArrayToSelectUserFunction01Result(data) {
    const result = {
        id: data[0],
        value: data[1]
    };
    return result;
}
//# sourceMappingURL=select-user-function01.js.map