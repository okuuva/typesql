"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.freshVar = freshVar;
exports.createColumnType = createColumnType;
exports.createColumnTypeFomColumnSchema = createColumnTypeFomColumnSchema;
exports.getInsertIntoTable = getInsertIntoTable;
exports.getInsertColumns = getInsertColumns;
exports.getDeleteColumns = getDeleteColumns;
exports.generateTypeInfo = generateTypeInfo;
exports.getVarType = getVarType;
exports.verifyDateTypesCoercion = verifyDateTypesCoercion;
exports.isTimeLiteral = isTimeLiteral;
exports.isDateTimeLiteral = isDateTimeLiteral;
exports.isDateLiteral = isDateLiteral;
exports.getFunctionName = getFunctionName;
const moment_1 = __importDefault(require("moment"));
const select_columns_1 = require("./select-columns");
const unify_1 = require("./unify");
let counter = 0;
function freshVar(name, typeVar, table, list) {
    const param = {
        kind: 'TypeVar',
        id: (++counter).toString(),
        name,
        type: typeVar,
        table
    };
    if (list) {
        param.list = true;
    }
    return param;
}
function createColumnType(col) {
    const columnType = {
        kind: 'TypeVar',
        id: (++counter).toString(),
        name: col.columnName,
        type: col.columnType.type,
        table: col.tableAlias || col.table
    };
    return columnType;
}
function createColumnTypeFomColumnSchema(col) {
    const columnType = {
        kind: 'TypeVar',
        id: col.column,
        name: col.column,
        type: col.column_type,
        table: col.table
    };
    return columnType;
}
function getInsertIntoTable(insertStatement) {
    const insertIntoTable = (0, select_columns_1.splitName)(insertStatement.tableRef().getText()).name;
    return insertIntoTable;
}
function getInsertColumns(insertStatement, fromColumns) {
    var _a;
    const insertIntoTable = getInsertIntoTable(insertStatement);
    const insertFields = insertStatement.insertFromConstructor() || insertStatement.insertQueryExpression();
    const fields = (_a = insertFields === null || insertFields === void 0 ? void 0 : insertFields.fields()) === null || _a === void 0 ? void 0 : _a.insertIdentifier_list().map((insertIdentifier) => {
        const colRef = insertIdentifier.columnRef();
        if (colRef) {
            const fieldName = (0, select_columns_1.splitName)(colRef.getText());
            const column = (0, select_columns_1.findColumn)(fieldName, fromColumns);
            return column;
        }
        throw Error('Invalid sql');
    });
    //check insert stmt without fields (only values). Ex.: insert into mytable values()
    if (!fields) {
        return fromColumns.filter((column) => column.table === insertIntoTable);
    }
    return fields;
}
function getDeleteColumns(deleteStatement, dbSchema) {
    var _a, _b;
    //TODO - Use extractColumnsFromTableReferences
    const tableNameStr = (_a = deleteStatement.tableRef()) === null || _a === void 0 ? void 0 : _a.getText();
    const tableAlias = (_b = deleteStatement.tableAlias()) === null || _b === void 0 ? void 0 : _b.getText();
    const tableName = (0, select_columns_1.splitName)(tableNameStr).name;
    const columns = dbSchema
        .filter((col) => col.table === tableName)
        .map((col) => {
        const colDef = {
            table: tableNameStr,
            tableAlias: tableAlias,
            columnName: col.column,
            columnType: createColumnTypeFomColumnSchema(col),
            columnKey: col.columnKey,
            notNull: col.notNull,
            hidden: col.hidden
        };
        return colDef;
    });
    return columns;
}
function generateTypeInfo(namedNodes, constraints) {
    const substitutions = {};
    (0, unify_1.unify)(constraints, substitutions);
    const parameters = namedNodes.map((param) => getVarType(substitutions, param.type));
    return parameters;
}
function getVarType(substitutions, typeVar) {
    if (typeVar.kind === 'TypeVar') {
        // if (typeVar.type != '?') {
        //     return typeVar.type;
        // }
        const subs = substitutions[typeVar.id];
        if (subs) {
            if (subs.id !== typeVar.id) {
                return getVarType(substitutions, subs);
            }
            const resultType = subs.list || typeVar.list ? `${subs.type}[]` : subs.type;
            return resultType;
        }
        // if (!subs) {
        //     return typeVar.type as MySqlType;
        // }
        const resultType = typeVar.list ? `${typeVar.type}[]` : typeVar.type;
        return resultType;
    }
    return '?';
}
function verifyDateTypesCoercion(type) {
    if (type.kind === 'TypeVar' && isDateTimeLiteral(type.name)) {
        type.type = 'datetime';
    }
    if (type.kind === 'TypeVar' && isDateLiteral(type.name)) {
        type.type = 'date';
    }
    if (type.kind === 'TypeVar' && isTimeLiteral(type.name)) {
        type.type = 'time';
    }
    return type;
}
function isTimeLiteral(literal) {
    return (0, moment_1.default)(literal, 'HH:mm:ss', true).isValid() || (0, moment_1.default)(literal, 'HH:mm', true).isValid();
}
function isDateTimeLiteral(literal) {
    return (0, moment_1.default)(literal, 'YYYY-MM-DD HH:mm:ss', true).isValid();
}
function isDateLiteral(literal) {
    return (0, moment_1.default)(literal, 'YYYY-MM-DD', true).isValid();
}
function getFunctionName(simpleExprFunction) {
    var _a, _b;
    return (((_a = simpleExprFunction.functionCall().pureIdentifier()) === null || _a === void 0 ? void 0 : _a.getText().toLowerCase()) ||
        ((_b = simpleExprFunction.functionCall().qualifiedIdentifier()) === null || _b === void 0 ? void 0 : _b.getText().toLowerCase()));
}
//# sourceMappingURL=collect-constraints.js.map