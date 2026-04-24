"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nested01 = nested01;
exports.nested01Nested = nested01Nested;
function nested01(db) {
    const sql = `
	-- @nested
	SELECT
		u.id as user_id,
		u.name as user_name,
		p.id as post_id,
		p.title as post_title
	FROM users u
	INNER JOIN posts p on p.fk_user = u.id
	`;
    return db.prepare(sql)
        .raw(true)
        .all()
        .map(data => mapArrayToNested01Result(data));
}
function mapArrayToNested01Result(data) {
    const result = {
        user_id: data[0],
        user_name: data[1],
        post_id: data[2],
        post_title: data[3]
    };
    return result;
}
function nested01Nested(db) {
    const selectResult = nested01(db);
    if (selectResult.length == 0) {
        return [];
    }
    return collectNested01NestedUsers(selectResult);
}
function collectNested01NestedUsers(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.user_id != null), r => r.user_id);
    return [...grouped.values()].map(row => ({
        user_id: row[0].user_id,
        user_name: row[0].user_name,
        posts: collectNested01NestedPosts(row),
    }));
}
function collectNested01NestedPosts(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.post_id != null), r => r.post_id);
    return [...grouped.values()].map(row => ({
        post_id: row[0].post_id,
        post_title: row[0].post_title,
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
//# sourceMappingURL=nested01.js.map