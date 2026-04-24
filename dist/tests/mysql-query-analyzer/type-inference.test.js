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
const parse_1 = require("../../src/mysql-query-analyzer/parse");
const create_schema_1 = require("./create-schema");
describe('type-inference test', () => {
    it('SELECT id FROM mytable1', () => {
        const sql = 'SELECT id FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id+id FROM mytable1', () => {
        const sql = 'SELECT id+id FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['bigint'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id as alias FROM mytable1', () => {
        const sql = 'SELECT id as alias FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT ? as name FROM mytable1', () => {
        const sql = 'SELECT ? as name FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['any'],
            parameters: ['any']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it.skip('SELECT 2 as intValue, 200000000000 as longVallue, false as falseValue, true as trueValue  FROM mytable1', () => {
        const sql = 'SELECT 2 as intValue, 2.0 as decimalValue, 2.0123123123 as decimalValue, false as falseValue, true as trueValue FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'decimal', 'decimal', 'decimal', 'bit', 'bit'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT ? FROM mytable1', () => {
        const sql = 'SELECT ? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['any'],
            parameters: ['any']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT ?, ?+2, ? FROM mytable1', () => {
        const sql = 'SELECT ?, ?+2, ? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['any', 'double', 'any'],
            parameters: ['any', 'double', 'any']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id + id + ? FROM mytable1', () => {
        const sql = 'SELECT id + id + ? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT ?+?', () => {
        const sql = 'SELECT ?+?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double', 'double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT t1.* FROM mytable2 t1', () => {
        const sql = 'SELECT t1.* FROM mytable2 t1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar', 'varchar'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT t1.id+t1.id+? FROM mytable2 t1', () => {
        const sql = 'SELECT t1.id+t1.id+? FROM mytable2 t1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('infer case 1', () => {
        const sql = 'SELECT CASE WHEN id = 1 then ? else id END from mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    //SELECT double_column+int_column from all_types;
    it('infer case 2', () => {
        const sql = 'SELECT ?+id from mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('infer case 2.2', () => {
        const sql = 'SELECT id+?+id+2 from mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('infer case 3', () => {
        const sql = 'SELECT case when id+2=? then id else ? end from mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['bigint', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('infer case 4', () => {
        const sql = 'SELECT case when id+2=? then id+id else ? end from mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['bigint'],
            parameters: ['bigint', 'bigint']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('infer case with subselect', () => {
        const sql = 'SELECT case when id=1 then ? else (select id from mytable1 where id = 1) end from mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT ? > 1 FROM mytable1', () => {
        const sql = 'SELECT ? > 1 FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT 1 < ? FROM mytable1', () => {
        const sql = 'SELECT 1 < ? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it(`SELECT ? > 'a' FROM mytable1`, () => {
        const sql = `SELECT ? > 'a' FROM mytable1`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it(`SELECT 'a' < ? FROM mytable1`, () => {
        const sql = `SELECT ? > 'a' FROM mytable1`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id < ? FROM mytable1', () => {
        const sql = 'SELECT id < ? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT ? > id FROM mytable1', () => {
        const sql = 'SELECT ? > id FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable2 WHERE name like ?', () => {
        const sql = 'SELECT id FROM mytable2 WHERE name like ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable2 WHERE name like ?', () => {
        const sql = 'SELECT id FROM mytable2 WHERE (name = ? or name = ?) and id > ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['varchar', 'varchar', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select without from clause', () => {
        const sql = `select 10, CONCAT_WS('a', ?), 'a' as name`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar', 'varchar'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT concat(name, name) FROM mytable2 WHERE concat(name, name) like ?', () => {
        const sql = 'SELECT concat(name, name) FROM mytable2 WHERE concat(name, name) like ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT concat(id, name, ?) FROM mytable2', () => {
        const sql = 'SELECT concat(id, name, ?) FROM mytable2';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT concat(id, name, ?+?) FROM mytable2', () => {
        const sql = 'SELECT concat(id, name, ?+?) FROM mytable2';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['double', 'double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable2 WHERE ? like name', () => {
        const sql = 'SELECT id FROM mytable2 WHERE ? like name';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it(`SELECT concat_ws('/', ?, ?, ?) FROM mytable1`, () => {
        const sql = `SELECT concat_ws('/', ?, ?, ?) FROM mytable1`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['varchar', 'varchar', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT concat(name, ?, ?) FROM mytable2', () => {
        const sql = 'SELECT concat(name, ?, ?) FROM mytable2';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['varchar', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('update mytable1 set id = ?', () => {
        const sql = 'update mytable1 set id = ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('update mytable1 set id = ?+id', () => {
        const sql = 'update mytable1 set id = ?+id';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('update mytable1 set id = floor(?+?)', () => {
        const sql = 'update mytable1 set id = floor(?+?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['double', 'double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable1 WHERE id in (?)', () => {
        const sql = 'SELECT name FROM mytable2 WHERE id in (?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['int[]']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable1 WHERE ? in (1, 2, 3)', () => {
        const sql = 'SELECT id FROM mytable1 WHERE ? in (1, 2, 3)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable3 WHERE double_value in (1, 2, 3, ?)', () => {
        const sql = 'SELECT id FROM mytable3 WHERE double_value in (1, 2, 3, ?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['double[]']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it(`SELECT id FROM mytable1 WHERE ? in ('a', 'b', 'c')`, () => {
        const sql = `SELECT id FROM mytable1 WHERE ? in ('a', 'b', 'c')`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it.skip(`SELECT id FROM mytable1 WHERE ? in (1, 2, 'a', 'b')`, () => {
        const sql = `SELECT id FROM mytable1 WHERE ? in (1, 2, 'a', 'b')`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable1 WHERE ? in (id+id, id-id)', () => {
        const sql = 'SELECT id FROM mytable1 WHERE ? in (id+id, id-id)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['bigint']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable1 WHERE id+id in (?)', () => {
        const sql = 'SELECT id FROM mytable1 WHERE id+id in (?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['bigint[]']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable1 WHERE id+id in (?, ?)', () => {
        const sql = 'SELECT id FROM mytable1 WHERE id+id in (?, ?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['bigint[]', 'bigint[]']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable1 WHERE id in (((?)))', () => {
        const sql = 'SELECT id FROM mytable1 WHERE id in (((?)))';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int[]']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select CURRENT_DATE > ?', () => {
        const sql = 'select CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP, LOCALTIME, LOCALTIMESTAMP';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['date', 'time', 'datetime', 'datetime', 'datetime'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable1 WHERE ? is not null OR id=?', () => {
        const sql = 'SELECT id FROM mytable1 WHERE ? is not null OR id=?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['any', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT * FROM mytable1', () => {
        const sql = 'SELECT * FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'int'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable1 t1 WHERE t1.id = ?', () => {
        const sql = 'SELECT id FROM mytable1 t1 WHERE t1.id = ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse a select with 3-levels nested select (with alias)', () => {
        const sql = `
        select id from (
            select matricula as id from (
                select name as matricula from mytable2 
            ) t1
        ) t2
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse a select with 3-levels nested select (with alias) and expression', () => {
        const sql = `
        select result from (
            select total as result from (
                select id+id as total from mytable2 
            ) t1
        ) t2
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['bigint'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse a select with nested select2', () => {
        const sql = `
        select id, name from (
            select t1.id, t2.name from mytable1 t1
            inner join mytable2 t2 on t1.id = t2.id
        ) t WHERE t.id+t.id = ? and t.name = ?
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar'],
            parameters: ['bigint', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('nested with *', () => {
        const sql = `
        SELECT * from (select * from (select name, id from mytable2) t1) t2
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar', 'int'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select name from mytable1, (select count(*) as name from mytable2) t2', () => {
        const sql = `
        select name from mytable1, (select count(*) as name from mytable2) t2
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['bigint'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT max(?) FROM mytable1', () => {
        const sql = 'SELECT max(?) FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['any'],
            parameters: ['any']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT max(id)=? FROM mytable1', () => {
        const sql = 'SELECT max(id)=? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT max(name)=? FROM mytable2', () => {
        const sql = 'SELECT max(name)=? FROM mytable2';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT min(id)=? FROM mytable1', () => {
        const sql = 'SELECT min(id)=? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT min(id+id)=? FROM mytable1', () => {
        const sql = 'SELECT min(id+id)=? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['bigint']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT count(id)=? FROM mytable1', () => {
        const sql = 'SELECT count(id)=? FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['bigint']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id+double_value FROM mytable3 WHERE double_value = ?', () => {
        const sql = 'SELECT id+double_value FROM mytable3 WHERE double_value = ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    //The SUM() and AVG() functions return a DECIMAL value for exact-value arguments (integer or DECIMAL),
    //and a DOUBLE value for approximate-value arguments (FLOAT or DOUBLE).
    //sum(id)=?, sum(double_value)=?, avg(id)=?,
    it('SELECT sum(id)=?, sum(double_value)=?, avg(id)=?, avg(double_value)=? FROM mytable1', () => {
        const sql = 'SELECT sum(id)=?, sum(double_value)=?, avg(id)=?, avg(double_value)=? FROM mytable3';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint', 'tinyint', 'tinyint', 'tinyint'],
            parameters: ['decimal', 'double', 'decimal', 'double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT sum(double_column) FROM all_types', () => {
        const sql = 'SELECT sum(double_column) FROM all_types';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT sum(float_column) FROM all_types', () => {
        const sql = 'SELECT sum(float_column) FROM all_types';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT sum(bigint_column) FROM all_types', () => {
        const sql = 'SELECT sum(bigint_column) FROM all_types';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['decimal'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT sum(int_column) FROM all_types', () => {
        const sql = 'SELECT sum(int_column) FROM all_types';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['decimal'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT sum(int_column+?) FROM all_types', () => {
        const sql = 'SELECT sum(int_column+?) FROM all_types';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    //select sum(int_column + (int_column + 2) * double_column) from all_types; return type double
    it('SELECT sum(id + (value + 2) + ?) FROM mytable1', () => {
        const sql = 'SELECT sum(id + (value + 2) + ?) FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    //SELECT sum(t1.int_column + (t1.int_column + 2) + t1.double_column ) FROM all_types t1
    it('SELECT sum(t1.id + (t1.value + 2) + ?) FROM mytable1 t1', () => {
        const sql = 'SELECT sum(t1.id + (t1.value + 2) + ?) FROM mytable1 t1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    //The return value has the same type as the first argument (assuming that it is integer, double, or decimal).
    it('SELECT round(id), round(double_value), round(1) FROM mytable3', () => {
        const sql = 'SELECT round(id)=?, round(double_value)=?, round(1)=? FROM mytable3';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint', 'tinyint', 'tinyint'],
            parameters: ['int', 'double', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    //select int_column + (int_column + double_column) * double_column from all_types; return type double
    it('select AVG with expression', () => {
        const sql = 'SELECT avg(value + (value + ?) * ?) FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double', 'double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT (SELECT ? FROM mytable2) FROM mytable1', () => {
        const sql = 'SELECT (SELECT ? FROM mytable2) FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['any'],
            parameters: ['any']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT (SELECT ? FROM mytable2 WHERE id = ?) FROM mytable1', () => {
        const sql = 'SELECT (SELECT ? FROM mytable2 WHERE id = ?) FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['any'],
            parameters: ['any', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT (SELECT id=? FROM mytable2 WHERE name = ?) FROM mytable1', () => {
        const sql = 'SELECT (SELECT id=? FROM mytable2 WHERE name = ?) FROM mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT * FROM mytable1 WHERE ? > (SELECT id FROM mytable2)', () => {
        const sql = 'SELECT * FROM mytable1 WHERE ? > (SELECT id FROM mytable2)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'int'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT * FROM mytable1 WHERE (SELECT id FROM mytable2) < ?', () => {
        const sql = 'SELECT * FROM mytable2 WHERE (SELECT id FROM mytable2) < ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar', 'varchar'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable2 WHERE (?, ?) = (SELECT name, id FROM mytable2 WHERE id = ?)', () => {
        const sql = 'SELECT id FROM mytable2 WHERE (?, ?) = (SELECT name, id FROM mytable2 WHERE id = ?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['varchar', 'int', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable2 WHERE (?, ?) in (SELECT name, id FROM mytable2 WHERE id = ?)', () => {
        const sql = 'SELECT id FROM mytable2 WHERE (?, ?) in (SELECT name, id FROM mytable2 WHERE id = ?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['varchar', 'int', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('in with subexpression', () => {
        const sql = `
        SELECT
            id
        FROM
            mytable2
        WHERE
            (case when id = 1 then ? else ? end, ?) in (
            SELECT
                id, name
            FROM
                mytable2
            WHERE
                id = 1)
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int', 'int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('in with case expression and subquery', () => {
        const sql = `SELECT id FROM mytable2 WHERE (case when id = 1 then ? else (select ? from mytable2 where id = 1) end) in (id)
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('in with case expression and subquery 2', () => {
        const sql = `
        SELECT id FROM mytable2
        WHERE (CASE WHEN id = 1 THEN ? ELSE (SELECT ? FROM mytable2 WHERE id = 1) END, ?) 
            IN (SELECT id + id, id FROM mytable1 WHERE id = ?)
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['bigint', 'bigint', 'int', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable2 WHERE ? = CASE WHEN id = 1 THEN id ELSE ? END', () => {
        const sql = 'SELECT id FROM mytable2 WHERE ? = CASE WHEN id = 1 THEN id ELSE ? END';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse select with case when expression (multiple parameters)', () => {
        const sql = `
        SELECT 
            CASE 
                WHEN id = 1 THEN ?
                WHEN id = 2 THEN id
                WHEN id = 3 then ?
                ELSE id
            END
        FROM mytable1
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse select with case when expression (multiple parameters) with alias', () => {
        const sql = `
        SELECT 
            CASE 
                WHEN id = 1 THEN ?
                WHEN id = 2 THEN id
                WHEN id = 3 then ?
                ELSE id
            END as result
        FROM mytable1
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse select with case when expression (multiple parameters) 2', () => {
        const sql = `
        SELECT 
            CASE 
                WHEN id = 1 THEN ?
                WHEN id = 2 THEN id+id
                WHEN id = 3 then ?
                ELSE id
            END as result
        FROM mytable1
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['bigint'],
            parameters: ['bigint', 'bigint']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse select with case when expression (multiple parameters) 3', () => {
        const sql = `
        SELECT 
            CASE 
                WHEN id = 1 THEN ?
                WHEN id = 2 THEN name
                WHEN id = 3 then 'a'
                ELSE ?
            END as result
        FROM mytable2
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['varchar', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse select with case when expression  (id+id)', () => {
        const sql = `
        SELECT 
            CASE 
                WHEN id = ? THEN ?
                ELSE id+id
            END 
        FROM mytable1
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['bigint'],
            parameters: ['int', 'bigint']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse select with case when expression (? in  not null)', () => {
        const sql = `
        SELECT
            CASE WHEN (? IS NOT NULL)
              THEN ?
              ELSE 'a'
            END
        FROM mytable2`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['any', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT id FROM mytable2 WHERE ? = CASE WHEN id = 1 THEN id ELSE ? END', () => {
        const sql = 'SELECT id FROM mytable2 WHERE ? = CASE WHEN id = 1 THEN id ELSE ? END';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int', 'int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT * FROM mytable1 t WHERE ? in (SELECT id FROM mytable2 m2 )', () => {
        const sql = 'SELECT * FROM mytable1 t WHERE ? in (SELECT id FROM mytable2 m2 )';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'int'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT ?=id FROM (SELECT id FROM mytable2) t', () => {
        const sql = 'SELECT ?=id FROM (SELECT id FROM mytable2) t';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['tinyint'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT total FROM (SELECT id+id as total FROM mytable2) t where total > ?', () => {
        const sql = 'SELECT total FROM (SELECT id+id as total FROM mytable2) t where total > ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['bigint'],
            parameters: ['bigint']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    //similar to select 3 + ? from...
    it('select 3 + case when id=4 then ? end from mytable1', () => {
        const sql = 'select 3 + case when id=4 then ? end from mytable1';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['double'],
            parameters: ['double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select floor(?+?)', () => {
        const sql = 'select floor(?+?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['bigint'],
            parameters: ['double', 'double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT t1.value from mytable1 t1 where t1.id = ?', () => {
        const sql = 'SELECT t1.value from mytable1 t1 where t1.id = ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT t1.value from mytable1 t1 where t1.id = ?', () => {
        const sql = `
        SELECT t1.value, t2.id, t2.name 
        FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
        WHERE t1.id = ? and t2.name = ?`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'int', 'varchar'],
            parameters: ['int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT * FROM mytable1 t1 INNER JOIN mytable2', () => {
        const sql = `
        SELECT * FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'int', 'int', 'varchar', 'varchar'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT t2.*, t1.* FROM mytable1 t1 INNER JOIN mytable2', () => {
        const sql = `
        SELECT t2.*, t1.*
        FROM mytable1 t1 
        INNER JOIN mytable2 t2 on t2.id = t1.id
        WHERE t1.id = ?
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar', 'varchar', 'int', 'int'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse a select with tablelist', () => {
        const sql = `
        SELECT t1.id, t2.name 
        FROM mytable1 t1, mytable2 t2
        WHERE t1.id = ? and t2.name = ?
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar'],
            parameters: ['int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse a select with tablelist (not ambiguous)', () => {
        const sql = 'SELECT name FROM mytable1, mytable2 where name = ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse a select with tablelist (unreferenced alias)', () => {
        const sql = 'SELECT name as fullname FROM mytable1 t1, mytable2 t2';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse a select with tablelist and subquery', () => {
        const sql = 'SELECT name, t.id FROM (select t1.*, t2.name from mytable1 t1, mytable2 t2) t';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar', 'int'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('parse a select with tablelist and subquery', () => {
        const sql = 'SELECT value FROM ((( mytable1, (select * from mytable2) t )))';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select name from mytable2 where exists ( select id from mytable1 where value = ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select name from mytable2 where exists ( select id from mytable1 where value = ?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['varchar'],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('parse a select with UNION', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable1
        UNION
        SELECT id FROM mytable2
        UNION
        SELECT id FROM mytable3
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('parse a select with UNION', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id, value FROM mytable1
        UNION
        SELECT id, name as value FROM mytable2
        UNION
        SELECT id, id as value FROM mytable3
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar'],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('parse a select with UNION and parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id, value FROM mytable1 where id = ?
        UNION
        SELECT id, name FROM mytable2 where name = ?
        UNION
        SELECT id, id FROM mytable3 where double_value = ?
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar'],
            parameters: ['int', 'varchar', 'double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('teste', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id, name as value FROM mytable2 where name = ?';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('teste', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id, name as value FROM mytable2 where name = ?
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int', 'varchar'],
            parameters: ['varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('inner join with parameters in the ON clause', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id
        FROM mytable1 t1
        INNER JOIN mytable2 t2 ON t1.id = ? and t2.name = ?
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    //TODO - id is ambigue
    it.skip('verify ambiguous column', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id
        FROM mytable1 t1
        INNER JOIN mytable2 t2 ON t1.id = 1
        `;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: ['int'],
            parameters: ['int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('reuse of named paramters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT :startDate, ADDDATE(:startDate, 31) as deadline';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            parameters: ['datetime', 'datetime'],
            columns: ['datetime', 'datetime']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select from table name with space', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * from `my table`';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            parameters: [],
            columns: ['int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select from table name with space and schema', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * from mydb.`my table`';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            parameters: [],
            columns: ['int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
});
//# sourceMappingURL=type-inference.test.js.map