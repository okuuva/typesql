"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const sql_generator_1 = require("../src/sql-generator");
describe('code-generator', () => {
    const columns = [
        {
            column: 'id',
            columnKey: 'PRI',
            autoincrement: true,
            column_type: 'int',
            notNull: true,
            table: '',
            schema: 'mydb',
            hidden: 0
        },
        {
            column: 'value',
            columnKey: '',
            autoincrement: false,
            column_type: 'int',
            notNull: false,
            table: '',
            schema: 'mydb',
            hidden: 0
        }
    ];
    it('test scaffolding select stmt', () => {
        const actual = (0, sql_generator_1.generateSelectStatement)('mysql2', 'mytable1', columns);
        const expected = `SELECT
    \`id\`,
    \`value\`
FROM mytable1
WHERE \`id\` = :id`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test scaffolding insert stmt', () => {
        const actual = (0, sql_generator_1.generateInsertStatement)('mysql2', 'mytable1', columns);
        const expected = `INSERT INTO mytable1
(
    \`value\`
)
VALUES
(
    :value
)`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test scaffolding update stmt', () => {
        const actual = (0, sql_generator_1.generateUpdateStatement)('mysql2', 'mytable1', columns);
        const expected = `UPDATE mytable1
SET
    \`value\` = CASE WHEN :valueSet THEN :value ELSE \`value\` END
WHERE
    \`id\` = :id`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test scaffolding delete stmt', () => {
        const actual = (0, sql_generator_1.generateDeleteStatement)('mysql2', 'mytable1', columns);
        const expected = `DELETE FROM mytable1
WHERE \`id\` = :id`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test tablename with whitespace', () => {
        const actual = (0, sql_generator_1.generateSelectStatement)('mysql2', 'my table', columns);
        const expected = `SELECT
    \`id\`,
    \`value\`
FROM \`my table\`
WHERE \`id\` = :id`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test scaffolding insert stmt with space in table name', () => {
        const actual = (0, sql_generator_1.generateInsertStatement)('mysql2', 'my table', columns);
        const expected = `INSERT INTO \`my table\`
(
    \`value\`
)
VALUES
(
    :value
)`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test scaffolding update stmt with space in table name', () => {
        const actual = (0, sql_generator_1.generateUpdateStatement)('mysql2', 'my table', columns);
        const expected = `UPDATE \`my table\`
SET
    \`value\` = CASE WHEN :valueSet THEN :value ELSE \`value\` END
WHERE
    \`id\` = :id`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test scaffolding delete stmt with space in table name', () => {
        const actual = (0, sql_generator_1.generateDeleteStatement)('mysql2', 'my table', columns);
        const expected = `DELETE FROM \`my table\`
WHERE \`id\` = :id`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
//# sourceMappingURL=sql-generator.test.js.map