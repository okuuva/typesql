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
exports.selectJsonBuildArray01 = selectJsonBuildArray01;
function selectJsonBuildArray01(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	SELECT
		json_build_array('a', 'b') as value1,
		jsonb_build_array(null, 'c', 10) as value2
	`;
        return client.query({ text: sql, rowMode: 'array' })
            .then(res => res.rows.length > 0 ? mapArrayToSelectJsonBuildArray01Result(res.rows[0]) : null);
    });
}
function mapArrayToSelectJsonBuildArray01Result(data) {
    const result = {
        value1: data[0],
        value2: data[1]
    };
    return result;
}
//# sourceMappingURL=select-json-build-array01.js.map