"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nested04WithoutJoinTable = nested04WithoutJoinTable;
exports.nested04WithoutJoinTableNested = nested04WithoutJoinTableNested;
function nested04WithoutJoinTable(db) {
    const sql = `
	-- @nested
	SELECT
		s.*,
		u.*
	FROM surveys s
	INNER JOIN participants p on p.fk_survey = s.id
	INNER JOIN users u on u.id = p.fk_user
	`;
    return db.prepare(sql)
        .raw(true)
        .all()
        .map(data => mapArrayToNested04WithoutJoinTableResult(data));
}
function mapArrayToNested04WithoutJoinTableResult(data) {
    const result = {
        id: data[0],
        name: data[1],
        id_2: data[2],
        name_2: data[3]
    };
    return result;
}
function nested04WithoutJoinTableNested(db) {
    const selectResult = nested04WithoutJoinTable(db);
    if (selectResult.length == 0) {
        return [];
    }
    return collectNested04WithoutJoinTableNestedSurveys(selectResult);
}
function collectNested04WithoutJoinTableNestedSurveys(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.id != null), r => r.id);
    return [...grouped.values()].map(row => ({
        id: row[0].id,
        name: row[0].name,
        users: collectNested04WithoutJoinTableNestedUsers(row),
    }));
}
function collectNested04WithoutJoinTableNestedUsers(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.id_2 != null), r => r.id_2);
    return [...grouped.values()].map(row => ({
        id: row[0].id_2,
        name: row[0].name_2,
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
//# sourceMappingURL=nested04-without-join-table.js.map