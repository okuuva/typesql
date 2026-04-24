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
exports.selectJson02 = selectJson02;
function selectJson02(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	SELECT
		json_build_object(
			'total', SUM(m.id),
			'count', COUNT(m.id),
			'coalesce', COALESCE(m.id, 0),
			'nested', COALESCE(json_agg(jsonb_build_object(
				'key1', 'value',
				'key2', 10
			)))
		) AS sum
	FROM mytable1 m
	GROUP BY id
	`;
        return client.query({ text: sql, rowMode: 'array' })
            .then(res => res.rows.map(row => mapArrayToSelectJson02Result(row)));
    });
}
function mapArrayToSelectJson02Result(data) {
    const result = {
        sum: data[0]
    };
    return result;
}
//# sourceMappingURL=select-json02.js.map