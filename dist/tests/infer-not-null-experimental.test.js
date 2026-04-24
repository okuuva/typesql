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
const infer_column_nullability_1 = require("../src/mysql-query-analyzer/infer-column-nullability");
const create_schema_1 = require("./mysql-query-analyzer/create-schema");
describe('infer-not-null-experimental', () => {
    it('select id from mytable1', () => {
        const sql = 'select id from mytable1';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select value from mytable1', () => {
        const sql = 'select value from mytable1';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select value from mytable1 where value is not null', () => {
        const sql = 'select value from mytable1 where value is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select * from mytable1 where value is not null', () => {
        const sql = 'select * from mytable1 where value is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select t1.* from mytable1 t1 where value is not null', () => {
        const sql = 'select t1.* from mytable1 t1 where value is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select value+10 from mytable1 where value is not null', () => {
        const sql = 'select value+10 from mytable1 where value is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it(`select *, 'desc' as description`, () => {
        const sql = `select *, 'desc' as description from mytable1 where value is not null`;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select value+10+? from mytable1 where value is not null', () => {
        const sql = 'select value+10+? from mytable1 where value is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true]; //changed at v0.0.2
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select t1.value from mytable1 t1 where t1.value is not null', () => {
        const sql = 'select t1.value from mytable1 t1 where t1.value is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select t1.value from mytable1 t1 where value is not null', () => {
        const sql = 'select t1.value from mytable1 t1 where value is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select value from mytable1 t1 where t1.value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 t1 where t1.value is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select t1.value + value from mytable1 t1 where t1.value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t1.value + value from mytable1 t1 where t1.value is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value as alias from mytable1 t1 where t1.value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value as alias from mytable1 t1 where t1.value is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select t1.value from mytable1 t1 where id is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t1.value from mytable1 t1 where id is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value from mytable1 where 10 > value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where 10 > value
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value from mytable1 where value is not null or (id > 0 or value is not null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null or (id > 0 or value is not null)
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value from mytable1 where value is not null and (id > 0 or value is not null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null and (id > 0 or value is not null)
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value from mytable1 where value is not null or (id > 0 and (id < 10 and value is not null))', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null or (id > 0 and (id < 10 and value is not null))
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value from mytable1 where id > 0 and id < 10 and value > 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where id > 0 and id < 10 and value > 1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value from mytable1 where value is not null and (value > 1 or value is null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null and (value > 1 or value is null)
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value from mytable1 where value is not null or (value > 1 and value is null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null or (value > 1 and value is null)
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value from mytable1 where value > 1 and value is null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value > 1 and value is null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value + value from mytable1 where value > 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value + value from mytable1 where value > 1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value + value from mytable1 where id > 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value + value from mytable1 where id > 1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value + id from mytable1 where value > 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value + id from mytable1 where value > 1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value+id from mytable1 where id > 10', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value+id from mytable1 where id > 10
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select id+id, value from mytable1 where value > 10', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id+id, value from mytable1 where value > 10
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select sum(value) from mytable1 where value > 10', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(value) from mytable1 where value > 10
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select sum(value) from mytable1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(value) from mytable1 where value is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('UNION 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION 
        select id from mytable1
        UNION
        select value from mytable1 where value is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('UNION 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION 
        select id from mytable1
        UNION
        select value from mytable1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('UNION 3', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION 
        select name from mytable2
        UNION
        select value from mytable1 where value is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('UNION 4', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION 
        select value from mytable1 where value is not null
        UNION
        select value from mytable1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('UNION 5', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select *, (select descr from mytable2 where id = 1) from mytable1 where value is not null
        UNION 
        select *, 'description' as description from mytable2 where name is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('UNION 6', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION 
        select value+value from mytable1 where value is not null
        UNION
        select value+id from mytable1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('UNION 7', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION 
        select value+value as total from mytable1 where value is not null
        UNION
        select value+id from mytable1 where value is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select (select id from mytable1 where id = 10), name, name as name2 from mytable2 where name = abc', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select (select id from mytable1 where id = 10), name, name as name2 from mytable2 where name = 'abc'
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select with subquery 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select (select id from mytable1 where id = 10) as name1, name, name as name2 from mytable2 where name = 'abc'
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select with subquery', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name, (select id from mytable1 where id = 10) from mytable2 where id is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select value + subquery', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id + (select id from mytable2 where id = 10 and id is not null) from mytable1 m1 where id is not null
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select name from (select name from mytable2 where name is not null) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from (select name from mytable2 where name is not null) t1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select name from (select id as name from mytable2) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from (select id as name from mytable2) t1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select id from (select * from mytable2) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (select * from mytable2) t1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select * from (select * from mytable2 where name is not null and id is not null) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select * from (select * from mytable2 where name is not null and id is not null) t1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select * from (select * from mytable2 where name is not null or id is not null) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select * from (select * from mytable2 where name is not null or id is not null) t1
            `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('select * from mytable1', () => {
        const sql = 'select * from mytable1';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select value+value from mytable1 where value is not null', () => {
        const sql = 'select value+value from mytable1 where value is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select value+value from mytable1 where value is not null', () => {
        const sql = 'select value+id from mytable1 where id is not null';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select * from (select * from (select * from mytable2 where name is not null) t1) t2', () => {
        const sql = 'select * from (select * from (select * from mytable2 where name is not null) t1) t2';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select * from (select * from (select * from mytable2 where id > 10) t1) t2', () => {
        const sql = 'select * from (select * from (select * from mytable2 where id > 10) t1) t2';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('3 levels of subselects on from  - where name is not null on the 2nd level', () => {
        const sql = 'select * from (select * from (select * from mytable2 where id > 10) t1 where name is not null) t2';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select with left join', () => {
        const sql = `
        select t1.id, t2.id, t1.value, t2.name 
        from mytable1 t1 
        left join mytable2 t2 on t1.id = t2.id;
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select with inner join after left join', () => {
        const sqlInnerJoin = `
        select t1.id, t2.id, t3.id, t1.value, t2.name, t3.double_value 
        from mytable1 t1 
        left join mytable2 t2 on t1.id = t2.id
        inner join mytable3 t3 on t2.id = t3.id
        `;
        const actualInnerJoin = (0, infer_column_nullability_1.parseAndInferNotNull)(sqlInnerJoin, create_schema_1.dbSchema);
        const expected = [true, true, true, false, false, false];
        node_assert_1.default.deepStrictEqual(actualInnerJoin, expected);
        //USE JOIN instead of INNER JOIN. The same result is expected
        const sqlJoin = `
        select t1.id, t2.id, t3.id, t1.value, t2.name, t3.double_value 
        from mytable1 t1 
        left join mytable2 t2 on t1.id = t2.id
        join mytable3 t3 on t2.id = t3.id
        `;
        const actualJoin = (0, infer_column_nullability_1.parseAndInferNotNull)(sqlJoin, create_schema_1.dbSchema);
        node_assert_1.default.deepStrictEqual(actualJoin, expected);
    });
    it('select with left join after inner join', () => {
        const sql = `
        select t1.id, t2.id, t3.id, t1.value, t2.name, t3.double_value 
        from mytable1 t1 
        inner join mytable2 t2 on t1.id = t2.id
        left join mytable3 t3 on t2.id = t3.id
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true, false, false, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select with left join after left join', () => {
        const sql = `
        select t1.id, t2.id, t3.id, t1.value, t2.name, t3.double_value 
        from mytable1 t1 
        left join mytable2 t2 on t1.id = t2.id
        left join mytable3 t3 on t2.id = t3.id
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false, false, false, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select with left join and internal inner join', () => {
        const sql = `
        select t1.id, t2.id, t3.id, t1.value, t2.name, t3.double_value
        from mytable1 t1 
        left join mytable2 t2
        	inner join mytable3 t3 on t2.id = t3.id
        on t1.id = t2.id
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false, false, false, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select with left join and internal inner join (using parentheses)', () => {
        const sql = `
        select t1.id, t2.id, t3.id, t1.value, t2.name, t3.double_value
        from mytable1 t1 
        left join (mytable2 t2
        	inner join mytable3 t3 on t2.id = t3.id)
        on t1.id = t2.id
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false, false, false, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select t1.*, t2.* from inner join', () => {
        const sql = `
        select t1.*, t2.*
        from mytable1 t1 
        inner join mytable2 t2 on t1.id = t2.id
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false, true, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select * with left join and internal inner join (using parentheses)', () => {
        const sql = `
        select t1.*
        from mytable1 t1 
        left join (mytable2 t2
        	inner join mytable3 t3 on t2.id = t3.id)
        on t1.id = t2.id
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select * with left join and internal inner join (using parentheses) 2', () => {
        const sql = `
        select t2.*
        from mytable1 t1 
        left join mytable2 t2
        on t1.id = t2.id
        where t2.name is not null
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false, true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select * from (union)', () => {
        const sql = `
        select * from (
        select * from mytable1 t1 
        union
        select * from mytable1 t1
        ) t
        where t.value > 10
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select * from (union) multiple subselect', () => {
        const sql = `
        select t1.value, t2.value from 
            (select value from mytable1) t1,
            (select value from mytable1) t2
        where t1.value is not null
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select * from (union)', () => {
        const sql = `
        select t1.value, t2.value from 
            (select value from mytable1) t1,
            (select value from mytable1) t2
        where t1.value is not null
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('inner join on t1.name = t2.name', () => {
        const sql = `
        SELECT t1.name, t2.name 
        FROM mytable2 t1 
        INNER JOIN mytable2 t2 on t1.name = t2.name
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('inner join on t1.name = t2.name or t1.name is null', () => {
        const sql = `
        SELECT t1.name, t2.name 
        FROM mytable2 t1 
        INNER JOIN mytable2 t2 on t1.name = t2.name or t1.name is null
        `;
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
//# sourceMappingURL=infer-not-null-experimental.test.js.map