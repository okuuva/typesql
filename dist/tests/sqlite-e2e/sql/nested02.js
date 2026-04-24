"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nested02 = nested02;
exports.nested02Nested = nested02Nested;
function nested02(db) {
    const sql = `
	-- @nested
	SELECT
		u.id as user_id,
		u.name as user_name,
		p.id as post_id,
		p.title as post_title,
		p.body  as post_body,
		r.id as role_id,
		r.role,
		c.id as comment_id,
		c.comment
	FROM users u
	INNER JOIN posts p on p.fk_user = u.id
	INNER JOIN roles r on r.fk_user = u.id
	INNER JOIN comments c on c.fk_post = p.id
	`;
    return db.prepare(sql)
        .raw(true)
        .all()
        .map(data => mapArrayToNested02Result(data));
}
function mapArrayToNested02Result(data) {
    const result = {
        user_id: data[0],
        user_name: data[1],
        post_id: data[2],
        post_title: data[3],
        post_body: data[4],
        role_id: data[5],
        role: data[6],
        comment_id: data[7],
        comment: data[8]
    };
    return result;
}
function nested02Nested(db) {
    const selectResult = nested02(db);
    if (selectResult.length == 0) {
        return [];
    }
    return collectNested02NestedUsers(selectResult);
}
function collectNested02NestedUsers(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.user_id != null), r => r.user_id);
    return [...grouped.values()].map(row => ({
        user_id: row[0].user_id,
        user_name: row[0].user_name,
        posts: collectNested02NestedPosts(row),
        roles: collectNested02NestedRoles(row),
    }));
}
function collectNested02NestedPosts(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.post_id != null), r => r.post_id);
    return [...grouped.values()].map(row => ({
        post_id: row[0].post_id,
        post_title: row[0].post_title,
        post_body: row[0].post_body,
        comments: collectNested02NestedComments(row),
    }));
}
function collectNested02NestedRoles(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.role_id != null), r => r.role_id);
    return [...grouped.values()].map(row => ({
        role_id: row[0].role_id,
        role: row[0].role,
    }));
}
function collectNested02NestedComments(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.comment_id != null), r => r.comment_id);
    return [...grouped.values()].map(row => ({
        comment_id: row[0].comment_id,
        comment: row[0].comment,
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
//# sourceMappingURL=nested02.js.map