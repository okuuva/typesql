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
exports.selectJsonBuildObject01 = selectJsonBuildObject01;
function selectJsonBuildObject01(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	SELECT
		json_build_object('key1', 'str1') as value1,
		json_build_object('key2', 10) as value2,
		jsonb_build_object('key3', 'str2') as value3,
		jsonb_build_object('key4', 20) as value4
	`;
        return client.query({ text: sql, rowMode: 'array' })
            .then(res => res.rows.length > 0 ? mapArrayToSelectJsonBuildObject01Result(res.rows[0]) : null);
    });
}
function mapArrayToSelectJsonBuildObject01Result(data) {
    const result = {
        value1: data[0],
        value2: data[1],
        value3: data[2],
        value4: data[3]
    };
    return result;
}
//# sourceMappingURL=select-json-build-object01.js.map