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
exports.nested03 = nested03;
exports.nested03Nested = nested03Nested;
function nested03(client, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	-- @nested
	SELECT
		c.id,
		a1.*,
		a2.*
	FROM clients as c
	INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
	LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
	WHERE c.id = $1
	`;
        return client.query({ text: sql, rowMode: 'array', values: [params.param1] })
            .then(res => res.rows.map(row => mapArrayToNested03Result(row)));
    });
}
function mapArrayToNested03Result(data) {
    const result = {
        id: data[0],
        id_2: data[1],
        address: data[2],
        id_3: data[3],
        address_2: data[4]
    };
    return result;
}
function nested03Nested(client, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const selectResult = yield nested03(client, params);
        if (selectResult.length == 0) {
            return [];
        }
        return collectNested03NestedC(selectResult);
    });
}
function collectNested03NestedC(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.id != null), r => r.id);
    return [...grouped.values()].map(row => {
        var _a;
        return ({
            id: row[0].id,
            a1: collectNested03NestedA1(row)[0],
            a2: (_a = collectNested03NestedA2(row)[0]) !== null && _a !== void 0 ? _a : null,
        });
    });
}
function collectNested03NestedA1(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.id_2 != null), r => r.id_2);
    return [...grouped.values()].map(row => ({
        id: row[0].id_2,
        address: row[0].address,
    }));
}
function collectNested03NestedA2(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.id_3 != null), r => r.id_3);
    return [...grouped.values()].map(row => ({
        id: row[0].id_3,
        address: row[0].address_2,
    }));
}
const groupBy = (array, predicate) => {
    return array.reduce((map, value, index, array) => {
        var _a, _b;
        const key = predicate(value, index, array);
        (_b = (_a = map.get(key)) === null || _a === void 0 ? void 0 : _a.push(value)) !== null && _b !== void 0 ? _b : map.set(key, [value]);
        return map;
    }, new Map());
};
//# sourceMappingURL=nested03.js.map