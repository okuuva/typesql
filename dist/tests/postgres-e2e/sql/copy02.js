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
exports.copy02 = copy02;
const pg_copy_streams_1 = require("pg-copy-streams");
const promises_1 = require("stream/promises");
const stream_1 = require("stream");
const columns = ['id', 'name', 'year'];
function copy02(client, values) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
	COPY mytable4 FROM STDIN WITH CSV
	`;
        const csv = jsonToCsv(values);
        const sourceStream = stream_1.Readable.from(csv);
        const stream = client.query((0, pg_copy_streams_1.from)(sql));
        yield (0, promises_1.pipeline)(sourceStream, stream);
    });
}
function jsonToCsv(values) {
    return values
        .map(value => columns.map(col => value[col])
        .map(val => escapeValue(val))
        .join(','))
        .join('\n');
}
function escapeValue(val) {
    if (val == null) {
        return '';
    }
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
}
//# sourceMappingURL=copy02.js.map