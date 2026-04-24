"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete02 = delete02;
function delete02(db, params) {
    const sql = `
	DELETE FROM mytable1 WHERE id=? RETURNING *
	`;
    const res = db.prepare(sql)
        .raw(true)
        .get([params.param1]);
    return mapArrayToDelete02Result(res);
}
function mapArrayToDelete02Result(data) {
    const result = {
        id: data[0],
        value: data[1]
    };
    return result;
}
//# sourceMappingURL=delete02.js.map