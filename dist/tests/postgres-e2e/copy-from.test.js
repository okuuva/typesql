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
const pg_1 = __importDefault(require("pg"));
const node_assert_1 = __importDefault(require("node:assert"));
const sql_1 = require("./sql");
describe('e2e-postgres-crud', () => __awaiter(void 0, void 0, void 0, function* () {
    const pool = new pg_1.default.Pool({
        connectionString: 'postgres://postgres:password@127.0.0.1:5432/postgres'
    });
    it('copy-from02', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = yield pool.connect();
        yield client.query('BEGIN');
        const values = [
            {
                year: 2001,
                name: 'name1',
                id: '1'
            },
            {
                year: null,
                name: 'name2',
                id: '2'
            },
            {
                id: '3',
                year: 2004,
                name: null,
            },
            {
                name: 'name4',
                year: 2004,
                id: '4'
            }
        ];
        try {
            yield (0, sql_1.copy02)(client, values);
            const actual = yield (0, sql_1.selectFromMytable4)(client);
            const expected = [
                {
                    year: 2001,
                    name: 'name1',
                    id: '1'
                },
                {
                    year: null,
                    name: 'name2',
                    id: '2'
                },
                {
                    id: '3',
                    year: 2004,
                    name: null,
                },
                {
                    name: 'name4',
                    year: 2004,
                    id: '4'
                }
            ];
            node_assert_1.default.deepStrictEqual(actual, expected);
        }
        finally {
            yield client.query('ROLLBACK');
            client.release();
        }
    }));
    it('copy-from02 - special characteres', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = yield pool.connect();
        yield client.query('BEGIN');
        const values = [
            {
                id: '1',
                year: 2001,
                name: 'name1, name1',
            },
            {
                id: '2',
                year: 2002,
                name: ' name2; name2 - ',
            },
            {
                id: '3',
                year: 2003,
                name: 'name3\nname3\tname4\n\n\n',
            },
            {
                id: '4',
                year: 2004,
                name: `name4 'name4' "name4" \`name4\``
            },
            {
                id: '5',
                year: 2005,
                name: ''
            }
        ];
        try {
            yield (0, sql_1.copy02)(client, values);
            const actual = yield (0, sql_1.selectFromMytable4)(client);
            node_assert_1.default.deepStrictEqual(actual, values);
        }
        finally {
            yield client.query('ROLLBACK');
            client.release();
        }
    }));
}));
//# sourceMappingURL=copy-from.test.js.map