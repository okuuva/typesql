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
const codegen_util_1 = require("../src/codegen/shared/codegen-util");
const mysql2_1 = require("../src/codegen/mysql2");
describe('rename invalid names', () => {
    it('rename duplicated column names', () => __awaiter(void 0, void 0, void 0, function* () {
        //duplicated names
        const columnNames = ['id', 'id', 'name', 'id'];
        const actual = (0, codegen_util_1.renameInvalidNames)(columnNames);
        const expected = ['id', 'id_2', 'name', 'id_3'];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('test escape properties', () => __awaiter(void 0, void 0, void 0, function* () {
        node_assert_1.default.deepStrictEqual((0, codegen_util_1.escapeInvalidTsField)('id'), 'id');
        node_assert_1.default.deepStrictEqual((0, codegen_util_1.escapeInvalidTsField)('id_id'), 'id_id'); //valid name
        node_assert_1.default.deepStrictEqual((0, codegen_util_1.escapeInvalidTsField)('1'), '1'); //valid name
        node_assert_1.default.deepStrictEqual((0, codegen_util_1.escapeInvalidTsField)('_'), '_'); //valid name
        node_assert_1.default.deepStrictEqual((0, codegen_util_1.escapeInvalidTsField)('$'), '$'); //valid name
        node_assert_1.default.deepStrictEqual((0, codegen_util_1.escapeInvalidTsField)('id+id'), '"id+id"'); //escaped
        node_assert_1.default.deepStrictEqual((0, codegen_util_1.escapeInvalidTsField)('id + id'), '"id + id"'); //escaped
        node_assert_1.default.deepStrictEqual((0, codegen_util_1.escapeInvalidTsField)('count(*)'), '"count(*)"'); //escaped
    }));
    it('rename/escape column names', () => __awaiter(void 0, void 0, void 0, function* () {
        //duplicated names
        const columnNames = ['id', 'id', 'id+id', 'id+id', 'id'];
        const actual = (0, codegen_util_1.renameInvalidNames)(columnNames);
        const expected = ['id', 'id_2', '"id+id"', '"id+id_2"', 'id_3'];
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('rename/escape column from TsDescriptor', () => __awaiter(void 0, void 0, void 0, function* () {
        const schema = {
            sql: 'UPDATE ...',
            queryType: 'Update',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'id',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'count(*)',
                    type: 'bigint',
                    notNull: true
                }
            ],
            data: [
                {
                    name: 'id+id',
                    columnType: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'name',
                    columnType: 'varchar',
                    notNull: true
                },
                {
                    name: 'name',
                    columnType: 'varchar',
                    notNull: true
                }
            ],
            orderByColumns: ['id', 'count(*)', `concat(name, ' ', name)`]
        };
        const actual = (0, mysql2_1.generateTsDescriptor)(schema);
        node_assert_1.default.deepStrictEqual(actual.columns.map((col) => col.name), ['id', 'id_2', '"count(*)"']);
        node_assert_1.default.deepStrictEqual(actual.data.map((col) => col.name), ['"id+id"']);
        node_assert_1.default.deepStrictEqual(actual.parameters.map((col) => col.name), ['name']); //remove duplicated parameters
        node_assert_1.default.deepStrictEqual(actual.orderByColumns, ['id', 'count(*)', `concat(name, ' ', name)`]);
    }));
    it('removeDuplicatedParameters: notNull (true) and notNull (false)', () => __awaiter(void 0, void 0, void 0, function* () {
        const parameters = [
            {
                name: 'name',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'name',
                columnType: 'varchar',
                notNull: false
            }
        ];
        const expected = [
            {
                name: 'name',
                columnType: 'varchar',
                notNull: false
            }
        ];
        const actual = (0, mysql2_1.removeDuplicatedParameters)(parameters);
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('removeDuplicatedParameters: notNull (false) and notNull (true)', () => __awaiter(void 0, void 0, void 0, function* () {
        const parameters = [
            {
                name: 'name',
                columnType: 'varchar',
                notNull: false
            },
            {
                name: 'name',
                columnType: 'varchar',
                notNull: true
            }
        ];
        const expected = [
            {
                name: 'name',
                columnType: 'varchar',
                notNull: false
            }
        ];
        const actual = (0, mysql2_1.removeDuplicatedParameters)(parameters);
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('removeDuplicatedParameters: notNull (true), notNull (true), notNull(false) ', () => __awaiter(void 0, void 0, void 0, function* () {
        const parameters = [
            {
                name: 'name',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'id',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'name',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'name',
                columnType: 'varchar',
                notNull: false
            },
            {
                name: 'id',
                columnType: 'varchar',
                notNull: false
            }
        ];
        const expected = [
            {
                name: 'name',
                columnType: 'varchar',
                notNull: false
            },
            {
                columnType: 'varchar',
                name: 'id',
                notNull: false
            }
        ];
        const actual = (0, mysql2_1.removeDuplicatedParameters)(parameters);
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
});
//# sourceMappingURL=rename-invalid-column-names.test.js.map