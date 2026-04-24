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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const query_executor_1 = require("../../src/sqlite-query-analyzer/query-executor");
const Either_1 = require("fp-ts/lib/Either");
const create_schema_1 = require("../mysql-query-analyzer/create-schema");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
describe('sqlite-query-executor', () => {
    it('loadDbSchema - Type Affinity', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchema = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const actual = dbSchema.value.filter((col) => col.table === 'all_types');
        const expected = create_schema_1.sqliteDbSchema.filter((col) => col.table === 'all_types');
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('loadDbSchema - test composite primary', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchema = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const actual = dbSchema.value.filter((col) => col.table === 'playlist_track');
        const expected = [
            {
                schema: 'main',
                table: 'playlist_track',
                column: 'PlaylistId',
                column_type: 'INTEGER',
                notNull: true,
                columnKey: 'PRI',
                hidden: 0
            },
            {
                schema: 'main',
                table: 'playlist_track',
                column: 'TrackId',
                column_type: 'INTEGER',
                notNull: true,
                columnKey: 'PRI',
                hidden: 0
            }
        ];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('loadDbSchema with attached database', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        db.exec(`attach database './users.db' as users`);
        const dbSchema = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const actual = dbSchema.value.filter((col) => col.table === 'mytable1' || (col.table === 'users' && col.schema === 'users'));
        const expected = [
            {
                column: 'id',
                column_type: 'INTEGER',
                columnKey: 'PRI',
                table: 'mytable1',
                schema: 'main',
                notNull: true,
                hidden: 0
            },
            {
                column: 'value',
                column_type: 'INTEGER',
                columnKey: '',
                table: 'mytable1',
                schema: 'main',
                notNull: false,
                hidden: 0
            },
            {
                column: 'id',
                column_type: 'INTEGER',
                columnKey: 'PRI',
                table: 'users',
                schema: 'users',
                notNull: true,
                hidden: 0
            },
            {
                column: 'username',
                column_type: 'TEXT',
                columnKey: 'UNI',
                table: 'users',
                schema: 'users',
                notNull: true,
                hidden: 0
            }
        ];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('loadDbSchema FTS', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchema = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const actual = dbSchema.value.filter((col) => col.table === 'mytable2_fts');
        const expected = [
            {
                column: 'id',
                column_type: '?',
                columnKey: 'VT',
                table: 'mytable2_fts',
                schema: 'main',
                notNull: false,
                hidden: 0
            },
            {
                column: 'name',
                column_type: '?',
                columnKey: 'VT',
                table: 'mytable2_fts',
                schema: 'main',
                notNull: false,
                hidden: 0
            },
            {
                column: 'descr',
                column_type: '?',
                columnKey: 'VT',
                table: 'mytable2_fts',
                schema: 'main',
                notNull: false,
                hidden: 0
            },
            {
                column: "mytable2_fts",
                columnKey: "VT",
                column_type: "?",
                notNull: false,
                schema: "main",
                table: "mytable2_fts",
                hidden: 1
            },
            {
                column: "rank",
                columnKey: "VT",
                column_type: "REAL",
                notNull: true,
                schema: "main",
                table: "mytable2_fts",
                hidden: 1
            }
        ];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('loadDbSchema - generated columns', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchema = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const actual = dbSchema.value.filter((col) => col.table === 'generated_column');
        const expected = [
            {
                column: 'id',
                column_type: 'INTEGER',
                columnKey: 'PRI',
                table: 'generated_column',
                schema: 'main',
                notNull: true,
                hidden: 0
            },
            {
                column: 'first_name',
                column_type: 'TEXT',
                columnKey: '',
                table: 'generated_column',
                schema: 'main',
                notNull: true,
                hidden: 0
            },
            {
                column: 'last_name',
                column_type: 'TEXT',
                columnKey: '',
                table: 'generated_column',
                schema: 'main',
                notNull: true,
                hidden: 0
            },
            {
                column: 'full_name',
                column_type: 'TEXT',
                columnKey: '',
                table: 'generated_column',
                schema: 'main',
                notNull: false,
                hidden: 2
            }
        ];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('loadDbSchema - json_each', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchema = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const actual = dbSchema.value.filter((col) => col.table === 'json_each');
        const expected = [
            {
                column: 'key',
                column_type: 'any',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: true,
                hidden: 0
            },
            {
                column: 'value',
                column_type: 'any',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: false,
                hidden: 0
            },
            {
                column: 'type',
                column_type: 'TEXT',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: false,
                hidden: 0
            },
            {
                column: 'atom',
                column_type: 'TEXT',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: false,
                hidden: 2
            },
            {
                column: 'id',
                column_type: 'TEXT',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: true,
                hidden: 0
            },
            {
                column: 'parent',
                column_type: 'INTEGER',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: false,
                hidden: 0
            },
            {
                column: 'fullkey',
                column_type: 'TEXT',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: true,
                hidden: 0
            },
            {
                column: 'path',
                column_type: 'TEXT',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: true,
                hidden: 0
            },
            {
                column: 'json',
                column_type: 'TEXT',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: true,
                hidden: 1
            },
            {
                column: 'root',
                column_type: 'TEXT',
                columnKey: '',
                table: 'json_each',
                schema: 'main',
                notNull: true,
                hidden: 1
            }
        ];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('loadCreateTableStmt', () => {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchema = (0, query_executor_1.loadCreateTableStmt)(db, 'mytable1');
        if ((0, Either_1.isLeft)(dbSchema)) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const actual = dbSchema.right;
        const expected = replaceNewlines(`CREATE TABLE mytable1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value INTEGER
)`);
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('loadDbSchema - albums with non unique index', () => {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchema = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const actual = dbSchema.value.filter(col => col.table === 'albums');
        const expected = [
            {
                column: "AlbumId",
                column_type: "INTEGER",
                columnKey: "PRI",
                notNull: true,
                schema: "main",
                table: "albums",
                hidden: 0
            },
            {
                column: "Title",
                column_type: "TEXT",
                columnKey: "",
                notNull: true,
                schema: "main",
                table: "albums",
                hidden: 0
            },
            {
                column: "ArtistId",
                column_type: "INTEGER",
                columnKey: "",
                notNull: true,
                schema: "main",
                table: "albums",
                hidden: 0
            },
        ];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('loadCreateTableStmtWithCheckConstraint', () => {
        const db = new better_sqlite3_1.default('./mydb.db');
        const queryResult = (0, query_executor_1.loadCreateTableStmtWithCheckConstraint)(db);
        if (queryResult.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ` + queryResult.error.description);
        }
        const actual = queryResult.value;
        const expected = replaceNewlines(`CREATE TABLE all_types (
    int_column INT,
    integer_column INTEGER,
    tinyiny_column TINYINT,
    smallint_column SMALLINT,
    mediumint_column MEDIUMINT,
    bigint_column BIGINT,
    unsignedbigint_column UNSIGNED BIGINT,
    int2_column INT2,
    int8_column INT8,
    character_column CHARACTER(20),
    varchar_column VARCHAR(255),
    varyingcharacter_column VARYING CHARACTER(255),
    nchar_column NCHAR(55),
    native_character_column NATIVE CHARACTER(70),
    nvarchar_column NVARCHAR(100),
    text_column TEXT,
    clob_column CLOB,
    blob_column BLOB,
    blob_column2,
    real_column REAL,
    double_column DOUBLE,
    doubleprecision_column DOUBLE PRECISION,
    float_column FLOAT,
    numeric_column NUMERIC,
    decimal_column DECIMAL(10,5),
    boolean_column BOOLEAN,
    date_column DATE,
    datetime_column DATETIME,
    integer_column_default INTEGER DEFAULT 10
, enum_column TEXT CHECK(enum_column IN ('x-small', 'small', 'medium', 'large', 'x-large')));CREATE TABLE enum_types(
    id INTEGER PRIMARY KEY,
    column1 TEXT CHECK(column1 IN ('A', 'B', 'C')),
    column2 INTEGER CHECK(column2 IN (1, 2)),
    column3 TEXT CHECK(column3 NOT IN ('A', 'B', 'C')),
    column4 TEXT CHECK(column4 LIKE '%a%'),
	column5 NOT NULL CHECK(column5 IN ('D', 'E'))
);CREATE TABLE enum_types2(
    id INTEGER PRIMARY KEY,
    column1 TEXT CHECK         (   column1 IN ('f', 'g')   )
)`);
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
function replaceNewlines(input) {
    return input.replace(/\n/g, '\r\n');
}
//# sourceMappingURL=sqlite-query-executor.test.js.map