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
const promise_1 = require("mysql2/promise");
const mysql_mapping_1 = require("../src/mysql-mapping");
// https://github.com/sidorares/node-mysql2/blob/master/lib/constants/types.js
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield (0, promise_1.createConnection)('mysql://root:password@localhost/mydb');
        const allTypes = [
            'decimal_column',
            'tinyint_column',
            'smallint_column',
            'int_column',
            'float_column',
            'double_column',
            'timestamp_column',
            'bigint_column',
            'mediumint_column',
            'date_column',
            'time_column',
            'datetime_column',
            'year_column',
            'varchar_column',
            'bit_column',
            'json_column',
            'enum_column',
            'set_column',
            'tinyblob_column',
            'mediumblob_column',
            'longblob_column',
            'blob_column',
            'tinytext_column',
            'mediumtext_column',
            'longtext_column',
            'text_column',
            'varbinary_column',
            'binary_column',
            'char_column',
            'geometry_column'
        ];
        //https://stackoverflow.com/questions/43241174/javascript-generating-all-combinations-of-elements-in-a-single-array-in-pairs
        const combinations = allTypes.flatMap((v, i) => allTypes.slice(i + 1).map((w) => ({ first: v, second: w })));
        const firstUnionColumns = combinations.map((c) => c.first + generateAlias(c)).join(', ');
        const secondUnionColumns = combinations.map((c) => c.second + generateAlias(c)).join(', ');
        const generateSql = `
        SELECT ${firstUnionColumns} FROM all_types
        UNION
        SELECT ${secondUnionColumns} FROM all_types`;
        // console.log("generatedSql=", generateSql);
        const result = yield conn.prepare(generateSql);
        const resultArray = result.statement.columns.map((col) => ({
            name: col.name,
            type: (0, mysql_mapping_1.convertTypeCodeToMysqlType)(col.columnType, col.flags, col.columnLength)
        }));
        const resultHash = resultArray.reduce((map, obj) => {
            map[obj.name] = obj.type;
            return map;
        }, {});
        console.log('resultHash=', JSON.stringify(resultHash, null, 2));
    });
}
function removeColumnFromName(nameWithColumn) {
    return nameWithColumn.split('_')[0];
}
function generateAlias(column) {
    return ` AS ${removeColumnFromName(column.first)}_${removeColumnFromName(column.second)}`;
}
// main();
//# sourceMappingURL=check-mysql-inference.js.map