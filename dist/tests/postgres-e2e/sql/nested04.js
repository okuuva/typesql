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
exports.nested04 = nested04;
exports.nested04Nested = nested04Nested;
function nested04(client) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return client.query({ text: sql, rowMode: 'array' })
            .then(res => res.rows.map(row => mapArrayToNested04Result(row)));
    });
}
function mapArrayToNested04Result(data) {
    const result = {
        surveyid: data[0],
        surveyname: data[1],
        participantid: data[2],
        userid: data[3],
        username: data[4]
    };
    return result;
}
function nested04Nested(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const selectResult = yield nested04(client);
        if (selectResult.length == 0) {
            return [];
        }
        return collectNested04NestedSurveys(selectResult);
    });
}
function collectNested04NestedSurveys(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.surveyid != null), r => r.surveyid);
    return [...grouped.values()].map(row => ({
        surveyid: row[0].surveyid,
        surveyname: row[0].surveyname,
        participants: collectNested04NestedParticipants(row),
    }));
}
function collectNested04NestedParticipants(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.participantid != null), r => r.participantid);
    return [...grouped.values()].map(row => ({
        participantid: row[0].participantid,
        users: collectNested04NestedUsers(row)[0],
    }));
}
function collectNested04NestedUsers(selectResult) {
    const grouped = groupBy(selectResult.filter(r => r.userid != null), r => r.userid);
    return [...grouped.values()].map(row => ({
        userid: row[0].userid,
        username: row[0].username,
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