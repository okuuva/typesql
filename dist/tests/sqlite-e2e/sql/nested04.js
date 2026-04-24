"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nested04 = nested04;
exports.nested04Nested = nested04Nested;
function nested04(db) {
    const sql = `
	-- @nested
	SELECT
		s.id as surveyId,
		s.name as surveyName,
		p.id as participantId,
		u.id as userId,
		u.name as userName
	FROM surveys s
	INNER JOIN participants p on p.fk_survey = s.id
	INNER JOIN users u on u.id = p.fk_user
	`;
    return db.prepare(sql)
        .raw(true)
        .all()
        .map(data => mapArrayToNested04Result(data));
}
function mapArrayToNested04Result(data) {
    const result = {
        surveyId: data[0],
        surveyName: data[1],
        participantId: data[2],
        userId: data[3],
        userName: data[4]
    };
    return result;
}
function nested04Nested(db) {
    const selectResult = nested04(db);
    if (selectResult.length == 0) {
        return [];
    }
    return collectNested04NestedSurveys(selectResult);
}
function collectNested04NestedSurveys(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.surveyId != null), r => r.surveyId);
    return [...grouped.values()].map(row => ({
        surveyId: row[0].surveyId,
        surveyName: row[0].surveyName,
        participants: collectNested04NestedParticipants(row),
    }));
}
function collectNested04NestedParticipants(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.participantId != null), r => r.participantId);
    return [...grouped.values()].map(row => ({
        participantId: row[0].participantId,
        users: collectNested04NestedUsers(row)[0],
    }));
}
function collectNested04NestedUsers(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.userId != null), r => r.userId);
    return [...grouped.values()].map(row => ({
        userId: row[0].userId,
        userName: row[0].userName,
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
//# sourceMappingURL=nested04.js.map