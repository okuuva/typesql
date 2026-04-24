"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insert03 = insert03;
function insert03(db, params) {
    const sql = `
	INSERT INTO mytable1(value) VALUES(?) RETURNING *
	`;
    const res = db.prepare(sql)
        .raw(true)
        .get([params.param1]);
    return mapArrayToInsert03Result(res);
}
function mapArrayToInsert03Result(data) {
    const result = {
        id: data[0],
        value: data[1]
    };
    return result;
}
//# sourceMappingURL=insert03.js.map