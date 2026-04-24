"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update03 = update03;
function update03(db, data, params) {
    const sql = `
	UPDATE mytable1 SET value = ? WHERE id = ? RETURNING *
	`;
    const res = db.prepare(sql)
        .raw(true)
        .get([data.param1, params.param1]);
    return mapArrayToUpdate03Result(res);
}
function mapArrayToUpdate03Result(data) {
    const result = {
        id: data[0],
        value: data[1]
    };
    return result;
}
//# sourceMappingURL=update03.js.map