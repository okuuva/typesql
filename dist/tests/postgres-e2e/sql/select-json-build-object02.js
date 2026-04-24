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
exports.selectJsonBuildObject02 = selectJsonBuildObject02;
function selectJsonBuildObject02(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	SELECT json_agg(
		json_build_object('key', name, 'key2', id)
	) AS result
	FROM (
		VALUES
			(1, 'a'),
			(2, 'b')
	) AS t(id, name)
	`;
        return client.query({ text: sql, rowMode: 'array' })
            .then(res => res.rows.length > 0 ? mapArrayToSelectJsonBuildObject02Result(res.rows[0]) : null);
    });
}
function mapArrayToSelectJsonBuildObject02Result(data) {
    const result = {
        result: data[0]
    };
    return result;
}
//# sourceMappingURL=select-json-build-object02.js.map