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
const insert_into_roles_1 = require("./sql/crud/roles/insert-into-roles");
const select_from_roles_1 = require("./sql/crud/roles/select-from-roles");
const update_roles_1 = require("./sql/crud/roles/update-roles");
describe('e2e-postgres-crud', () => {
    const pool = new pg_1.default.Pool({
        connectionString: 'postgres://postgres:password@127.0.0.1:5432/postgres'
    });
    it('insert-default-value', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = yield pool.connect();
        yield client.query('BEGIN');
        try {
            const insertedRole = yield (0, insert_into_roles_1.insertIntoRoles)(client, { fk_user: 1 });
            const actual = yield (0, select_from_roles_1.selectFromRoles)(client, { id: insertedRole.id });
            const expected = {
                id: insertedRole.id,
                fk_user: 1,
                role: 'user'
            };
            node_assert_1.default.deepStrictEqual(actual, expected);
        }
        finally {
            yield client.query('ROLLBACK');
            client.release();
        }
    }));
    it('update-default-value', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = yield pool.connect();
        yield client.query('BEGIN');
        try {
            const insertedRole = yield (0, insert_into_roles_1.insertIntoRoles)(client, { fk_user: 1 });
            yield (0, update_roles_1.updateRoles)(client, { role: 'admin' }, { id: insertedRole.id });
            const actual = yield (0, select_from_roles_1.selectFromRoles)(client, { id: insertedRole.id });
            const expected = {
                id: insertedRole.id,
                fk_user: 1,
                role: 'admin'
            };
            node_assert_1.default.deepStrictEqual(actual, expected);
        }
        finally {
            yield client.query('ROLLBACK');
            client.release();
        }
    }));
});
//# sourceMappingURL=crud.test.js.map