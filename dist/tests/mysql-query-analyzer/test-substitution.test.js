"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const unify_1 = require("../../src/mysql-query-analyzer/unify");
describe.skip('Substitution tests', () => {
    const u1 = {
        kind: 'TypeVar',
        id: '0',
        name: 'u1',
        type: 'int'
    };
    const u2 = {
        kind: 'TypeVar',
        id: '1',
        name: 'u2',
        type: 'varchar'
    };
    const u3 = {
        kind: 'TypeVar',
        id: '2',
        name: 'u3',
        type: '?'
    };
    const substitutions = {
        0: u1,
        1: u2,
        2: u1
    };
    it('substitute 1', () => {
        //id -> int
        const type1 = {
            kind: 'TypeVar',
            id: '10',
            name: 'id',
            type: 'int'
        };
        const actual = (0, unify_1.substitute)(type1, substitutions);
        const expected = type1;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('substitute 2', () => {
        const newInt = {
            kind: 'TypeVar',
            id: '10',
            name: 'id',
            type: 'int'
        };
        const actual = (0, unify_1.substitute)(newInt, substitutions);
        node_assert_1.default.deepStrictEqual(actual, newInt, 'substitution 1');
        const actual2 = (0, unify_1.substitute)(u1, substitutions);
        node_assert_1.default.deepStrictEqual(actual2, u1, 'substitution 2');
        const actual3 = (0, unify_1.substitute)(u3, substitutions);
        node_assert_1.default.deepStrictEqual(actual3, u1, 'substitution 3');
    });
    it.skip('substitution case when', () => {
        const constraints = [
            {
                expression: '?+id',
                type1: { kind: 'TypeVar', id: '15', name: '?', type: '?' },
                type2: { kind: 'TypeVar', id: '16', name: 'id', type: 'int' },
                mostGeneralType: true
            },
            {
                expression: '?+id',
                type1: { kind: 'TypeVar', id: '14', name: '?+id', type: 'double' },
                type2: { kind: 'TypeVar', id: '15', name: '?', type: '?' },
                mostGeneralType: true
            },
            {
                expression: '?+id',
                type1: { kind: 'TypeVar', id: '14', name: '?+id', type: 'double' },
                type2: { kind: 'TypeVar', id: '16', name: 'id', type: 'int' },
                mostGeneralType: true
            },
            {
                expression: 'THEN?+id',
                type1: {
                    kind: 'TypeVar',
                    id: '1',
                    name: 'CASEWHENid=1THEN?+idWHENid=2THEN2WHENid=3then?ELSE1END',
                    type: '?'
                },
                type2: { kind: 'TypeVar', id: '14', name: '?+id', type: 'double' },
                mostGeneralType: true
            },
            {
                expression: 'THEN2',
                type1: {
                    kind: 'TypeVar',
                    id: '1',
                    name: 'CASEWHENid=1THEN?+idWHENid=2THEN2WHENid=3then?ELSE1END',
                    type: '?'
                },
                type2: { kind: 'TypeVar', id: '17', name: '2', type: 'int' },
                mostGeneralType: true
            },
            {
                expression: 'then?',
                type1: {
                    kind: 'TypeVar',
                    id: '1',
                    name: 'CASEWHENid=1THEN?+idWHENid=2THEN2WHENid=3then?ELSE1END',
                    type: '?'
                },
                type2: { kind: 'TypeVar', id: '18', name: '?', type: '?' },
                mostGeneralType: true
            },
            {
                expression: 'ELSE1',
                type1: {
                    kind: 'TypeVar',
                    id: '1',
                    name: 'CASEWHENid=1THEN?+idWHENid=2THEN2WHENid=3then?ELSE1END',
                    type: '?'
                },
                type2: { kind: 'TypeVar', id: '19', name: '1', type: 'int' },
                mostGeneralType: true
            },
            {
                expression: 'ELSE1',
                type1: { kind: 'TypeVar', id: '14', name: '?+id', type: 'double' },
                type2: { kind: 'TypeVar', id: '19', name: '1', type: 'int' },
                mostGeneralType: true
            },
            {
                expression: 'ELSE1',
                type1: { kind: 'TypeVar', id: '17', name: '2', type: 'int' },
                type2: { kind: 'TypeVar', id: '19', name: '1', type: 'int' },
                mostGeneralType: true
            },
            {
                expression: 'ELSE1',
                type1: { kind: 'TypeVar', id: '18', name: '?', type: '?' },
                type2: { kind: 'TypeVar', id: '19', name: '1', type: 'int' },
                mostGeneralType: true
            }
        ];
        const substitutions = {};
        (0, unify_1.unify)(constraints, substitutions);
        const expected = {
            '1': {
                kind: 'TypeVar',
                id: '14',
                name: '?+id',
                type: 'double',
                list: undefined
            },
            '15': {
                kind: 'TypeVar',
                id: '16',
                name: 'id',
                type: 'double',
                list: undefined
            },
            '16': { kind: 'TypeVar', id: '14', name: '?+id', type: 'double' },
            '17': {
                kind: 'TypeVar',
                id: '14',
                name: '?+id',
                type: 'double',
                list: undefined
            },
            '18': {
                kind: 'TypeVar',
                id: '14',
                name: '?+id',
                type: 'double',
                list: undefined
            },
            '19': {
                kind: 'TypeVar',
                id: '14',
                name: '?+id',
                type: 'double',
                list: undefined
            }
        };
        node_assert_1.default.deepStrictEqual(substitutions, expected);
    });
    it('int+int', () => {
        const typeInt = {
            kind: 'TypeVar',
            id: '0',
            name: 'id',
            type: 'int'
        };
        const typeNumber = {
            kind: 'TypeVar',
            id: '1',
            name: 'id',
            type: 'number'
        };
        const typeVarLeft = {
            kind: 'TypeVar',
            id: '2',
            name: '?',
            type: '?'
        };
        const typeVarRight = {
            kind: 'TypeVar',
            id: '3',
            name: '?',
            type: '?'
        };
        const typeVarResult = {
            kind: 'TypeVar',
            id: '4',
            name: '?',
            type: '?'
        };
        const constraints = [
            {
                expression: 'id+id',
                type1: typeVarResult,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'id',
                type1: typeVarLeft,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarRight,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'id',
                type1: typeVarLeft,
                type2: typeInt,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarRight,
                type2: typeInt,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarLeft,
                type2: typeVarRight,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarResult,
                type2: typeVarRight,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarResult,
                type2: typeVarLeft,
                mostGeneralType: true
            }
        ];
        const substitutions = {};
        (0, unify_1.unify)(constraints, substitutions);
        console.log('unify===', substitutions);
        node_assert_1.default.deepStrictEqual(substitutions[2].type, 'bigint');
        node_assert_1.default.deepStrictEqual(substitutions[3].type, 'bigint');
        node_assert_1.default.deepStrictEqual(substitutions[4].type, 'bigint');
    });
    it('int+double', () => {
        const typeInt = {
            kind: 'TypeVar',
            id: '0',
            name: 'id',
            type: 'int'
        };
        const typeDouble = {
            kind: 'TypeVar',
            id: '10',
            name: 'id',
            type: 'double'
        };
        const typeNumber = {
            kind: 'TypeVar',
            id: '1',
            name: 'id',
            type: 'number'
        };
        const typeVarLeft = {
            kind: 'TypeVar',
            id: '2',
            name: '?',
            type: '?'
        };
        const typeVarRight = {
            kind: 'TypeVar',
            id: '3',
            name: '?',
            type: '?'
        };
        const typeVarResult = {
            kind: 'TypeVar',
            id: '4',
            name: '?',
            type: '?'
        };
        const constraints = [
            {
                expression: 'id+double_value',
                type1: typeVarResult,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'id',
                type1: typeVarLeft,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarRight,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'id',
                type1: typeVarLeft,
                type2: typeInt,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarRight,
                type2: typeDouble,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarLeft,
                type2: typeVarRight,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarResult,
                type2: typeVarRight,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarResult,
                type2: typeVarLeft,
                mostGeneralType: true
            }
        ];
        const substitutions = {};
        (0, unify_1.unify)(constraints, substitutions);
        console.log('unify===', substitutions);
        node_assert_1.default.deepStrictEqual(substitutions[2].type, 'double');
        node_assert_1.default.deepStrictEqual(substitutions[3].type, 'double');
        node_assert_1.default.deepStrictEqual(substitutions[4].type, 'double');
    });
    it('int+?', () => {
        const typeInt = {
            kind: 'TypeVar',
            id: '0',
            name: 'id',
            type: 'int'
        };
        const typeParam = {
            kind: 'TypeVar',
            id: '10',
            name: '?',
            type: '?'
        };
        const typeNumber = {
            kind: 'TypeVar',
            id: '1',
            name: 'id',
            type: 'number'
        };
        const typeVarLeft = {
            kind: 'TypeVar',
            id: '2',
            name: '?',
            type: '?'
        };
        const typeVarRight = {
            kind: 'TypeVar',
            id: '3',
            name: '?',
            type: '?'
        };
        const typeVarResult = {
            kind: 'TypeVar',
            id: '4',
            name: '?',
            type: '?'
        };
        const constraints = [
            {
                expression: 'id+double_value',
                type1: typeVarResult,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'id',
                type1: typeVarLeft,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarRight,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'id',
                type1: typeVarLeft,
                type2: typeInt,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarRight,
                type2: typeParam,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarLeft,
                type2: typeVarRight,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarResult,
                type2: typeVarRight,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarResult,
                type2: typeVarLeft,
                mostGeneralType: true
            }
        ];
        const substitutions = {};
        (0, unify_1.unify)(constraints, substitutions);
        console.log('unify===', substitutions);
        node_assert_1.default.deepStrictEqual(substitutions[2].type, 'number');
        node_assert_1.default.deepStrictEqual(substitutions[3].type, 'number');
        node_assert_1.default.deepStrictEqual(substitutions[4].type, 'number');
    });
    it('bigint+?', () => {
        const typeInt = {
            kind: 'TypeVar',
            id: '0',
            name: 'id',
            type: 'bigint'
        };
        const typeParam = {
            kind: 'TypeVar',
            id: '10',
            name: '?',
            type: '?'
        };
        const typeNumber = {
            kind: 'TypeVar',
            id: '1',
            name: 'id',
            type: 'number'
        };
        const typeVarLeft = {
            kind: 'TypeVar',
            id: '2',
            name: '?',
            type: '?'
        };
        const typeVarRight = {
            kind: 'TypeVar',
            id: '3',
            name: '?',
            type: '?'
        };
        const typeVarResult = {
            kind: 'TypeVar',
            id: '4',
            name: '?',
            type: '?'
        };
        const constraints = [
            {
                expression: 'id+double_value',
                type1: typeVarResult,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'id',
                type1: typeVarLeft,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarRight,
                type2: typeNumber,
                mostGeneralType: true
            },
            {
                expression: 'id',
                type1: typeVarLeft,
                type2: typeInt,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarRight,
                type2: typeParam,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarLeft,
                type2: typeVarRight,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarResult,
                type2: typeVarRight,
                mostGeneralType: true
            },
            {
                expression: 'value',
                type1: typeVarResult,
                type2: typeVarLeft,
                mostGeneralType: true
            }
        ];
        const substitutions = {};
        (0, unify_1.unify)(constraints, substitutions);
        console.log('unify===', substitutions);
        node_assert_1.default.deepStrictEqual(substitutions[2].type, 'number');
        node_assert_1.default.deepStrictEqual(substitutions[3].type, 'number');
        node_assert_1.default.deepStrictEqual(substitutions[4].type, 'number');
    });
});
//# sourceMappingURL=test-substitution.test.js.map