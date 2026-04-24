"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndGenerateCode = validateAndGenerateCode;
exports.generateCrud = generateCrud;
exports.getQueryName = getQueryName;
exports.generateTsCode = generateTsCode;
exports.mapFieldToTsField = mapFieldToTsField;
const Either_1 = require("fp-ts/lib/Either");
const parser_1 = require("../sqlite-query-analyzer/parser");
const mysql2_1 = require("./mysql2");
const ts_nested_descriptor_1 = require("../ts-nested-descriptor");
const describe_query_1 = require("../describe-query");
const query_executor_1 = require("../sqlite-query-analyzer/query-executor");
const ts_dynamic_query_descriptor_1 = require("../ts-dynamic-query-descriptor");
const sqlite_1 = require("../drivers/sqlite");
const codegen_util_1 = require("./shared/codegen-util");
function validateAndGenerateCode(client, sql, queryName, sqliteDbSchema, isCrud = false) {
    const { sql: processedSql } = (0, describe_query_1.preprocessSql)(sql, 'sqlite');
    const explainSqlResult = (0, query_executor_1.explainSql)(client.client, processedSql);
    if ((0, Either_1.isLeft)(explainSqlResult)) {
        return (0, Either_1.left)({
            name: 'Invalid sql',
            description: explainSqlResult.left.description
        });
    }
    const code = generateTsCode(sql, queryName, sqliteDbSchema, client.type, isCrud);
    return code;
}
function mapToColumnInfo(col, checkOptional) {
    const defaultValue = col.columnKey === 'PRI' && col.column_type === 'INTEGER' ? 'AUTOINCREMENT' : col.defaultValue;
    const columnInfo = {
        name: col.column,
        notNull: col.notNull,
        type: col.column_type,
        table: col.table,
        optional: checkOptional && (!col.notNull || defaultValue != null)
    };
    return columnInfo;
}
function generateCrud(client, queryType, tableName, dbSchema) {
    const columns = dbSchema.filter((col) => col.table === tableName);
    const columnInfo = columns.map((col) => mapToColumnInfo(col, queryType === 'Insert' || queryType === 'Update'));
    const keys = columns.filter((col) => col.columnKey === 'PRI');
    if (keys.length === 0) {
        keys.push(...columns.filter((col) => col.columnKey === 'UNI'));
    }
    const keyColumnInfo = keys.map((key) => mapToColumnInfo(key, false)).map((col) => mapColumnToTsParameterDescriptor(col, client));
    const resultColumns = mapColumns(client, queryType, columnInfo, false);
    const params = columnInfo.map((col) => mapColumnToTsParameterDescriptor(col, client));
    const tsDescriptor = {
        sql: '',
        queryType,
        multipleRowsResult: false,
        columns: resultColumns,
        parameterNames: [],
        parameters: queryType === 'Insert' ? params : keyColumnInfo,
        data: queryType === 'Update' ? params.filter((param) => { var _a; return param.name !== ((_a = keyColumnInfo[0]) === null || _a === void 0 ? void 0 : _a.name); }) : []
    };
    const queryName = getQueryName(queryType, tableName);
    const code = generateCodeFromTsDescriptor(client, queryName, tsDescriptor, true, tableName);
    return code;
}
function getQueryName(queryType, tableName) {
    const camelCaseName = (0, codegen_util_1.convertToCamelCaseName)(tableName);
    const captitalizedName = (0, codegen_util_1.capitalize)(camelCaseName);
    switch (queryType) {
        case 'Select':
            return `selectFrom${captitalizedName}`;
        case 'Insert':
            return `insertInto${captitalizedName}`;
        case 'Update':
            return `update${captitalizedName}`;
        case 'Delete':
            return `deleteFrom${captitalizedName}`;
    }
}
function generateTsCode(sql, queryName, sqliteDbSchema, client, isCrud = false) {
    const schemaDefResult = (0, parser_1.parseSql)(sql, sqliteDbSchema);
    if ((0, Either_1.isLeft)(schemaDefResult)) {
        return schemaDefResult;
    }
    const tsDescriptor = createTsDescriptor(schemaDefResult.right, client);
    const code = generateCodeFromTsDescriptor(client, queryName, tsDescriptor, isCrud);
    return (0, Either_1.right)(code);
}
function createTsDescriptor(queryInfo, client) {
    var _a;
    const tsDescriptor = {
        sql: queryInfo.sql,
        queryType: queryInfo.queryType,
        multipleRowsResult: queryInfo.multipleRowsResult,
        returning: queryInfo.returning,
        columns: mapColumns(client, queryInfo.queryType, queryInfo.columns, queryInfo.returning),
        parameterNames: [],
        parameters: queryInfo.parameters.map((param) => mapParameterToTsFieldDescriptor(param, client)),
        data: (_a = queryInfo.data) === null || _a === void 0 ? void 0 : _a.map((param) => mapParameterToTsFieldDescriptor(param, client)),
        orderByColumns: queryInfo.orderByColumns
    };
    if (queryInfo.nestedInfo) {
        const nestedDescriptor2 = queryInfo.nestedInfo.map((relation) => {
            const tsRelation = {
                groupIndex: relation.groupIndex,
                name: relation.name,
                fields: relation.fields.map((field) => mapFieldToTsField(queryInfo.columns, field, client)),
                relations: relation.relations.map((relation) => (0, ts_nested_descriptor_1.mapToTsRelation2)(relation))
            };
            return tsRelation;
        });
        tsDescriptor.nestedDescriptor2 = nestedDescriptor2;
    }
    tsDescriptor.dynamicQuery2 = queryInfo.dynamicSqlQuery2;
    return tsDescriptor;
}
function mapColumns(client, queryType, columns, returning = false) {
    if (!returning) {
        const resultColumns = getInsertUpdateResult(client);
        if (queryType === 'Insert') {
            return resultColumns;
        }
        if (queryType === 'Update' || queryType === 'Delete') {
            return [resultColumns[0]];
        }
    }
    const escapedColumnsNames = (0, codegen_util_1.renameInvalidNames)(columns.map((col) => col.name));
    return columns.map((col, index) => mapColumnToTsFieldDescriptor(Object.assign(Object.assign({}, col), { name: escapedColumnsNames[index] }), client));
}
function getInsertUpdateResult(client) {
    const sqliteInsertColumns = [
        {
            name: 'changes',
            tsType: 'number',
            notNull: true
        },
        {
            name: 'lastInsertRowid',
            tsType: 'number',
            notNull: true
        }
    ];
    const libSqlInsertColumns = [
        {
            name: 'rowsAffected',
            tsType: 'number',
            notNull: true
        },
        {
            name: 'lastInsertRowid',
            tsType: 'number',
            notNull: true
        }
    ];
    const d1InsertColumns = [
        {
            name: 'changes',
            tsType: 'number',
            notNull: true
        },
        {
            name: 'last_row_id',
            tsType: 'number',
            notNull: true
        }
    ];
    switch (client) {
        case 'better-sqlite3':
        case 'bun:sqlite':
            return sqliteInsertColumns;
        case 'libsql':
            return libSqlInsertColumns;
        case 'd1':
            return d1InsertColumns;
    }
}
function mapFieldToTsField(columns, field, client) {
    const tsField = {
        name: field.name,
        index: field.index,
        tsType: sqlite_1.mapper.mapColumnType(columns[field.index].type, client),
        notNull: columns[field.index].intrinsicNotNull
    };
    return tsField;
}
function mapParameterToTsFieldDescriptor(col, client) {
    const tsDesc = {
        name: col.name,
        tsType: sqlite_1.mapper.mapColumnType(col.columnType, client),
        notNull: col.notNull ? col.notNull : false,
        toDriver: parameterToDriver(col),
        isArray: false
    };
    return tsDesc;
}
function parameterToDriver(param) {
    if (param.columnType === 'DATE') {
        return `${param.name}?.toISOString().split('T')[0]`;
    }
    if (param.columnType === 'DATE_TIME') {
        return `${param.name}?.toISOString().split('.')[0].replace('T', ' ')`;
    }
    return param.name;
}
function columnToDriver(col) {
    if (col.type === 'DATE') {
        return `${col.name}?.toISOString().split('T')[0]`;
    }
    if (col.type === 'DATE_TIME') {
        return `${col.name}?.toISOString().split('.')[0].replace('T', ' ')`;
    }
    return col.name;
}
function mapColumnToTsFieldDescriptor(col, client) {
    const tsDesc = {
        name: col.name,
        tsType: sqlite_1.mapper.mapColumnType(col.type, client),
        notNull: col.notNull,
        optional: col.optional
    };
    return tsDesc;
}
function mapColumnToTsParameterDescriptor(col, client) {
    const tsDesc = {
        name: col.name,
        tsType: sqlite_1.mapper.mapColumnType(col.type, client),
        notNull: col.notNull,
        optional: col.optional,
        toDriver: columnToDriver(col),
        isArray: false
    };
    return tsDesc;
}
function generateCodeFromTsDescriptor(client, queryName, tsDescriptor, isCrud = false, tableName = '') {
    var _a, _b, _c;
    const writer = (0, codegen_util_1.createCodeBlockWriter)();
    const { camelCaseName, capitalizedName, dataTypeName, resultTypeName, paramsTypeName, orderByTypeName, dynamicParamsTypeName, selectColumnsTypeName, whereTypeName } = (0, codegen_util_1.createTypeNames)(queryName);
    const queryType = tsDescriptor.queryType;
    const sql = tsDescriptor.sql;
    const generateOrderBy = tsDescriptor.orderByColumns != null && tsDescriptor.orderByColumns.length > 0;
    const uniqueParams = (0, codegen_util_1.removeDuplicatedParameters2)(tsDescriptor.parameters);
    const uniqueUpdateParams = (0, codegen_util_1.removeDuplicatedParameters2)(tsDescriptor.data || []);
    const orderByField = generateOrderBy ? `orderBy` : undefined;
    const paramsTypes = (0, codegen_util_1.removeDuplicatedParameters2)(tsDescriptor.dynamicQuery2 == null ? tsDescriptor.parameters : (0, ts_dynamic_query_descriptor_1.mapToDynamicParams)(tsDescriptor.parameters));
    let functionArguments = client === 'better-sqlite3' || client === 'bun:sqlite'
        ? 'db: Database'
        : client === 'd1'
            ? 'db: D1Database'
            : 'client: Client | Transaction';
    if (queryType === 'Update' && uniqueUpdateParams.length > 0) {
        functionArguments += `, data: ${dataTypeName}`;
    }
    if (tsDescriptor.dynamicQuery2 == null) {
        functionArguments += tsDescriptor.parameters.length > 0 || generateOrderBy ? `, params: ${paramsTypeName}` : '';
    }
    else {
        functionArguments += `, ${orderByField ? 'params' : 'params?'}: ${dynamicParamsTypeName}`;
    }
    const orNull = queryType === 'Select' ? ' | null' : '';
    const returnType = tsDescriptor.multipleRowsResult ? `${resultTypeName}[]` : `${resultTypeName}${orNull}`;
    const allParameters = (((_a = tsDescriptor.data) === null || _a === void 0 ? void 0 : _a.map((param) => toDriver('data', param))) || []).concat(tsDescriptor.parameters.map((param) => toDriver('params', param)));
    const queryParamsWithoutBrackets = allParameters.length > 0 ? `${allParameters.join(', ')}` : '';
    const queryParams = queryParamsWithoutBrackets !== '' ? `[${queryParamsWithoutBrackets}]` : '';
    const isDynamicQuery = tsDescriptor.dynamicQuery2 != null;
    writeImports(writer, client, isDynamicQuery);
    if (tsDescriptor.dynamicQuery2 != null) {
        writer.blankLine();
        (0, codegen_util_1.writeDynamicQueryParamType)(writer, queryName, paramsTypes.length > 0, orderByField);
        writer.blankLine();
        (0, mysql2_1.writeTypeBlock)(writer, paramsTypes, paramsTypeName, false, tsDescriptor.dynamicQuery2 ? undefined : orderByField);
        const resultTypes = tsDescriptor.columns.map((c) => (Object.assign(Object.assign({}, c), { optional: true, notNull: true })));
        (0, codegen_util_1.writeResultType)(writer, resultTypeName, resultTypes);
        writer.blankLine();
        const selectFields = (0, ts_dynamic_query_descriptor_1.mapToDynamicSelectColumns)(tsDescriptor.columns);
        (0, mysql2_1.writeTypeBlock)(writer, selectFields, selectColumnsTypeName, false);
        (0, codegen_util_1.writeSelectFragements)(writer, tsDescriptor.dynamicQuery2.select, tsDescriptor.columns);
        writer.blankLine();
        (0, codegen_util_1.writeDynamicQueryOperators)(writer, whereTypeName, tsDescriptor.columns);
        writer.blankLine();
        const asyncModified = client === 'libsql' || client === 'd1' ? 'async ' : '';
        const returnTypeModifier = client === 'libsql' || client === 'd1' ? `Promise<${returnType}>` : returnType;
        writer.write(`export ${asyncModified}function ${camelCaseName}(${functionArguments}): ${returnTypeModifier}`).block(() => {
            writer.blankLine();
            writer.writeLine('const { sql, paramsValues } = buildSql(params);');
            if (client === 'better-sqlite3') {
                writer.write('return db.prepare(sql)').newLine();
                writer.indent().write('.raw(true)').newLine();
                writer.indent().write('.all(paramsValues)').newLine();
                writer
                    .indent()
                    .write(`.map(data => mapArrayTo${resultTypeName}(data, params?.select))${tsDescriptor.multipleRowsResult ? '' : '[0]'};`);
            }
            if (client === 'bun:sqlite') {
                writer.write('return db.prepare(sql)').newLine();
                writer.indent().write('.values(paramsValues)').newLine();
                writer
                    .indent()
                    .write(`.map(data => mapArrayTo${resultTypeName}(data, params?.select))${tsDescriptor.multipleRowsResult ? '' : '[0]'};`);
            }
            if (client === 'd1') {
                writer.write('return db.prepare(sql)').newLine();
                writer.indent().write('.bind(...paramsValues)').newLine();
                writer.indent().write('.raw()').newLine();
                writer
                    .indent()
                    .write(`.then(rows => rows.map(row => mapArrayTo${resultTypeName}(row, params?.select)))${tsDescriptor.multipleRowsResult ? '' : '[0]'};`);
            }
            if (client === 'libsql') {
                writer.write('return client.execute({ sql, args: paramsValues })').newLine();
                writer.indent().write('.then(res => res.rows)').newLine();
                writer
                    .indent()
                    .write(`.then(rows => rows.map(row => mapArrayTo${resultTypeName}(row, params?.select)))${tsDescriptor.multipleRowsResult ? '' : '[0]'};`);
            }
        });
        if (tsDescriptor.dynamicQuery2) {
            writer.blankLine();
            (0, codegen_util_1.writeBuildSqlFunction)(writer, {
                dynamicParamsTypeName,
                columns: tsDescriptor.columns,
                parameters: tsDescriptor.parameters,
                dynamicQueryInfo: tsDescriptor.dynamicQuery2,
                dialect: 'sqlite',
                hasOrderBy: orderByField != null,
                toDrive: toDriver
            });
        }
        writer.blankLine();
        (0, codegen_util_1.writeMapToResultFunction)(writer, {
            columns: tsDescriptor.columns,
            resultTypeName,
            selectColumnsTypeName,
            fromDriver: fromDriver
        });
        if (orderByField != null) {
            writer.blankLine();
            (0, codegen_util_1.writeOrderByToObjectFunction)(writer, dynamicParamsTypeName);
        }
        writer.blankLine();
        writer.write('type WhereConditionResult = ').block(() => {
            writer.writeLine('sql: string;');
            writer.writeLine('hasValue: boolean;');
            writer.writeLine('values: any[];');
        });
        writer.blankLine();
        (0, codegen_util_1.writeWhereConditionFunction)(writer, whereTypeName, tsDescriptor.columns);
        if ((0, mysql2_1.hasDateColumn)(tsDescriptor.columns)) {
            writer.blankLine();
            writer.write('function isDate(value: any): value is Date').block(() => {
                writer.writeLine('return value instanceof Date;');
            });
        }
    }
    if (tsDescriptor.dynamicQuery2 == null) {
        if (uniqueUpdateParams.length > 0) {
            writer.blankLine();
            writer.write(`export type ${dataTypeName} =`).block(() => {
                uniqueUpdateParams.forEach((field) => {
                    const optionalOp = field.optional || isCrud ? '?' : '';
                    const orNull = field.notNull ? '' : ' | null';
                    writer.writeLine(`${field.name}${optionalOp}: ${field.tsType}${orNull};`);
                });
            });
        }
        if (uniqueParams.length > 0 || generateOrderBy) {
            writer.blankLine();
            writer.write(`export type ${paramsTypeName} =`).block(() => {
                uniqueParams.forEach((field) => {
                    const optionalOp = field.optional ? '?' : '';
                    const orNull = field.notNull ? '' : ' | null';
                    writer.writeLine(`${field.name}${optionalOp}: ${field.tsType}${orNull};`);
                });
                if (generateOrderBy) {
                    writer.writeLine(`orderBy: ${orderByTypeName}[];`);
                }
            });
        }
        writer.blankLine();
        (0, codegen_util_1.writeResultType)(writer, resultTypeName, tsDescriptor.columns);
        writer.blankLine();
    }
    if (isCrud) {
        const crudFunction = client === 'libsql' || client === 'd1'
            ? `async function ${camelCaseName}(${functionArguments}): Promise<${returnType}>`
            : `function ${camelCaseName}(${functionArguments}): ${returnType}`;
        writer.write(`export ${crudFunction}`).block(() => {
            const idColumn = tsDescriptor.parameters[0].name;
            writeExecuteCrudBlock(client, queryType, tableName, tsDescriptor.columns, idColumn, client === 'bun:sqlite' || client === 'd1' ? queryParamsWithoutBrackets : queryParams, paramsTypeName, dataTypeName, resultTypeName, writer);
        });
        if (client !== 'd1' && (queryType === 'Select' || tsDescriptor.returning)) {
            writer.blankLine();
            writeMapFunction(writer, { resultTypeName, columns: tsDescriptor.columns });
        }
        if (client === 'libsql' && queryType !== 'Select' && !tsDescriptor.returning) {
            writer.blankLine();
            writeMapFunctionByName(writer, { resultTypeName, columns: tsDescriptor.columns });
        }
    }
    const executeFunctionParams = {
        functionName: camelCaseName,
        returnType,
        resultTypeName,
        dataTypeName,
        sql: (0, mysql2_1.replaceOrderByParam)(sql),
        multipleRowsResult: tsDescriptor.multipleRowsResult,
        parameters: allParameters,
        columns: tsDescriptor.columns,
        queryType,
        paramsTypeName,
        returning: tsDescriptor.returning || false,
        orderBy: (((_b = tsDescriptor.orderByColumns) === null || _b === void 0 ? void 0 : _b.length) || 0) > 0,
        uniqueUpdateParams
    };
    if (tsDescriptor.dynamicQuery2 == null && !isCrud) {
        writeExecFunction(writer, client, executeFunctionParams);
    }
    if ((_c = tsDescriptor.orderByColumns) === null || _c === void 0 ? void 0 : _c.length) {
        writer.blankLine();
        (0, codegen_util_1.writeBuildOrderByBlock)(writer, tsDescriptor.orderByColumns, orderByTypeName);
    }
    if (tsDescriptor.nestedDescriptor2) {
        const relations = tsDescriptor.nestedDescriptor2 || [];
        (0, codegen_util_1.writeNestedTypes)(writer, relations, capitalizedName);
        writer.blankLine();
        relations.forEach((relation, index) => {
            const relationType = (0, codegen_util_1.generateRelationType)(capitalizedName, relation.name);
            if (index === 0) {
                if (client === 'better-sqlite3' || client === 'bun:sqlite') {
                    writer.write(`export function ${camelCaseName}Nested(${functionArguments}): ${relationType}[]`).block(() => {
                        const params = tsDescriptor.parameters.length > 0 ? ', params' : '';
                        writer.writeLine(`const selectResult = ${camelCaseName}(db${params});`);
                        writer.write('if (selectResult.length == 0)').block(() => {
                            writer.writeLine('return [];');
                        });
                        writer.writeLine(`return collect${relationType}(selectResult);`);
                    });
                }
                else if (client === 'libsql' || client === 'd1') {
                    writer.write(`export async function ${camelCaseName}Nested(${functionArguments}): Promise<${relationType}[]>`).block(() => {
                        const params = tsDescriptor.parameters.length > 0 ? ', params' : '';
                        const functionParam = client === 'libsql' ? `client${params}` : `db${params}`;
                        writer.writeLine(`const selectResult = await ${camelCaseName}(${functionParam});`);
                        writer.write('if (selectResult.length == 0)').block(() => {
                            writer.writeLine('return [];');
                        });
                        writer.writeLine(`return collect${relationType}(selectResult);`);
                    });
                }
            }
            (0, codegen_util_1.writeCollectFunction)(writer, relation, tsDescriptor.columns, capitalizedName, resultTypeName);
        });
        writer.blankLine();
        (0, codegen_util_1.writeGroupByFunction)(writer);
    }
    return writer.toString();
}
function writeExecuteCrudBlock(client, queryType, tableName, columns, idColumn, queryParams, paramTypeName, dataTypeName, resultTypeName, writer) {
    switch (queryType) {
        case 'Select':
            return writeExecutSelectCrudBlock(client, tableName, idColumn, columns, queryParams, resultTypeName, writer);
        case 'Insert':
            return writeExecuteInsertCrudBlock(client, tableName, paramTypeName, resultTypeName, writer);
        case 'Update':
            return writeExecuteUpdateCrudBlock(client, tableName, idColumn, dataTypeName, resultTypeName, writer);
        case 'Delete':
            return writeExecutDeleteCrudBlock(client, tableName, idColumn, queryParams, resultTypeName, writer);
    }
}
function writeExecutSelectCrudBlock(client, tableName, idColumn, columns, queryParams, resultTypeName, writer) {
    writer.blankLine();
    writer.writeLine('const sql = `SELECT');
    columns.forEach((col, index) => {
        const separator = index < columns.length - 1 ? ',' : '';
        writer.indent(2).write(`${col.name}${separator}`).newLine();
    });
    writer.indent().write(`FROM ${tableName}`).newLine();
    writer.indent().write(`WHERE ${idColumn} = ?\``).newLine();
    writer.blankLine();
    if (client === 'better-sqlite3') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write('.raw(true)').newLine();
        writer.indent().write(`.all(${queryParams})`).newLine();
        writer.indent().write(`.map(data => mapArrayTo${resultTypeName}(data))[0];`);
    }
    else if (client === 'bun:sqlite') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.values(${queryParams})`).newLine();
        writer.indent().write(`.map(data => mapArrayTo${resultTypeName}(data))[0];`);
    }
    else if (client === 'd1') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.bind(${queryParams})`).newLine();
        writer.indent().write('.first();').newLine();
    }
    else {
        writer.write(`return client.execute({ sql, args: ${queryParams} })`).newLine();
        writer.indent().write('.then(res => res.rows)').newLine();
        writer.indent().write(`.then(rows => mapArrayTo${resultTypeName}(rows[0]));`);
    }
}
function writeExecuteInsertCrudBlock(client, tableName, paramTypeName, resultTypeName, writer) {
    writer.blankLine();
    writer.writeLine(`const keys = Object.keys(params) as Array<keyof ${paramTypeName}>;`);
    writer.writeLine('const columns = keys.filter(key => params[key] !== undefined);');
    writer.writeLine('const values = columns.map(col => params[col]!);');
    writer.blankLine();
    writer.writeLine('const sql = columns.length == 0');
    writer.indent().write(`? \`INSERT INTO ${tableName} DEFAULT VALUES\``).newLine();
    writer.indent().write(`: \`INSERT INTO ${tableName}(\${columns.join(',')}) VALUES(\${columns.map(_ => '?').join(',')})\``).newLine();
    writer.blankLine();
    if (client === 'better-sqlite3') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.run(values) as ${resultTypeName};`);
    }
    else if (client === 'bun:sqlite') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.run(...values) as ${resultTypeName};`);
    }
    else if (client === 'd1') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write('.bind(...values)').newLine();
        writer.indent().write('.run()').newLine();
        writer.indent().write('.then(res => res.meta);');
    }
    else {
        writer.write('return client.execute({ sql, args: values })').newLine();
        writer.indent().write(`.then(res => mapArrayTo${resultTypeName}(res));`).newLine();
    }
}
function writeExecuteUpdateCrudBlock(client, tableName, idColumn, paramTypeName, resultTypeName, writer) {
    writer.blankLine();
    writer.writeLine(`const keys = Object.keys(data) as Array<keyof ${paramTypeName}>;`);
    writer.writeLine('const columns = keys.filter(key => data[key] !== undefined);');
    writer.writeLine(`const values = columns.map(col => data[col]!).concat(params.${idColumn});`);
    writer.blankLine();
    writer.writeLine('const sql = `');
    writer.indent().write(`UPDATE ${tableName}`).newLine();
    writer.indent().write(`SET \${columns.map(col => \`\${col} = ?\`).join(', ')}`).newLine();
    writer.indent().write(`WHERE ${idColumn} = ?\``).newLine();
    writer.blankLine();
    if (client === 'better-sqlite3') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.run(values) as ${resultTypeName};`);
    }
    else if (client === 'bun:sqlite') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.run(...values) as ${resultTypeName};`);
    }
    else if (client === 'd1') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.bind(params.${idColumn})`).newLine();
        writer.indent().write('.run()').newLine();
        writer.indent().write('.then(res => res.meta);');
    }
    else {
        writer.write('return client.execute({ sql, args: values })').newLine();
        writer.indent().write(`.then(res => mapArrayTo${resultTypeName}(res));`).newLine();
    }
}
function writeExecutDeleteCrudBlock(client, tableName, idColumn, queryParams, resultTypeName, writer) {
    writer.blankLine();
    writer.writeLine('const sql = `DELETE');
    writer.indent().write(`FROM ${tableName}`).newLine();
    writer.indent().write(`WHERE ${idColumn} = ?\``).newLine();
    writer.blankLine();
    if (client === 'better-sqlite3') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.run(${queryParams}) as ${resultTypeName};`).newLine();
    }
    else if (client === 'bun:sqlite') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.run(${queryParams}) as ${resultTypeName};`).newLine();
    }
    else if (client === 'd1') {
        writer.write('return db.prepare(sql)').newLine();
        writer.indent().write(`.bind(${queryParams})`).newLine();
        writer.indent().write('.run()').newLine();
        writer.indent().write('.then(res => res.meta);');
    }
    else {
        writer.write(`return client.execute({ sql, args: ${queryParams} })`).newLine();
        writer.indent().write(`.then(res => mapArrayTo${resultTypeName}(res));`).newLine();
    }
}
function fromDriver(variableData, param) {
    if (param.tsType === 'Date') {
        if (param.notNull) {
            return `new Date(${variableData})`;
        }
        return `${variableData} != null ? new Date(${variableData}) : ${variableData}`;
    }
    if (param.tsType === 'boolean') {
        return `${variableData} != null ? Boolean(${variableData}) : ${variableData}`;
    }
    return variableData;
}
function toDriver(variableName, param) {
    var _a;
    if (param.tsType === 'Date') {
        return `${variableName}.${param.toDriver}`;
    }
    if (param.tsType === 'boolean') {
        const variable = `${variableName}.${param.name}`;
        return `${variable} != null ? Number(${variable}) : ${variable}`;
    }
    if ((_a = param.tsType) === null || _a === void 0 ? void 0 : _a.endsWith('[]')) {
        return `...${variableName}.${param.name}`;
    }
    return `${variableName}.${param.name}`;
}
function writeImports(writer, client, isDynamicQuery) {
    switch (client) {
        case 'better-sqlite3':
            writer.writeLine(`import type { Database } from 'better-sqlite3';`);
            if (isDynamicQuery) {
                writer.writeLine(`import { EOL } from 'os';`);
            }
            return;
        case 'libsql':
            writer.writeLine(`import type { Client, Transaction } from '@libsql/client';`);
            if (isDynamicQuery) {
                writer.writeLine(`import { EOL } from 'os';`);
            }
            return;
        case 'bun:sqlite':
            writer.writeLine(`import type { Database } from 'bun:sqlite';`);
            if (isDynamicQuery) {
                writer.writeLine(`import { EOL } from 'os';`);
            }
            return;
        case 'd1':
            writer.writeLine(`import type { D1Database } from '@cloudflare/workers-types';`);
            if (isDynamicQuery) {
                writer.writeLine(`const EOL = '\\n';`);
            }
            return;
        default:
            return client;
    }
}
function writeExecFunction(writer, client, params) {
    const { functionName, returnType, sql, multipleRowsResult, parameters, columns, queryType, returning, paramsTypeName, resultTypeName, dataTypeName, orderBy, uniqueUpdateParams } = params;
    let restParameters = queryType === 'Update' && uniqueUpdateParams.length > 0 ? `, data: ${dataTypeName}` : '';
    const dynamicQuery = false;
    if (!dynamicQuery) {
        restParameters += parameters.length > 0 || orderBy ? `, params: ${paramsTypeName}` : '';
    }
    const queryParametersWithoutBrackes = parameters.join(', ');
    const queryParams = queryParametersWithoutBrackes != '' ? `[${queryParametersWithoutBrackes}]` : '';
    const mapFunctionParams = {
        resultTypeName,
        columns
    };
    switch (client) {
        case 'better-sqlite3':
            const betterSqliteArgs = 'db: Database' + restParameters;
            if (queryType === 'Select' || returning) {
                writer.write(`export function ${functionName}(${betterSqliteArgs}): ${returnType}`).block(() => {
                    (0, codegen_util_1.writeSql)(writer, sql);
                    if (multipleRowsResult) {
                        writer.write('return db.prepare(sql)').newLine();
                        writer.indent().write('.raw(true)').newLine();
                        writer.indent().write(`.all(${queryParams})`).newLine();
                        writer.indent().write(`.map(data => mapArrayTo${resultTypeName}(data));`);
                    }
                    else {
                        writer.write('const res = db.prepare(sql)').newLine();
                        writer.indent().write('.raw(true)').newLine();
                        writer.indent().write(`.get(${queryParams});`).newLine();
                        writer.blankLine();
                        if (!returning) {
                            writer.write(`return res ? mapArrayTo${resultTypeName}(res) : null;`);
                        }
                        else {
                            writer.write(`return mapArrayTo${resultTypeName}(res);`);
                        }
                    }
                });
                writer.blankLine();
                writeMapFunction(writer, mapFunctionParams);
            }
            if ((queryType === 'Update' || queryType === 'Delete' || queryType === 'Insert') && !returning) {
                writer.write(`export function ${functionName}(${betterSqliteArgs}): ${resultTypeName}`).block(() => {
                    (0, codegen_util_1.writeSql)(writer, sql);
                    writer.write('return db.prepare(sql)').newLine();
                    writer.indent().write(`.run(${queryParams}) as ${resultTypeName};`);
                });
            }
            return;
        case 'libsql':
            const libSqlArgs = 'client: Client | Transaction' + restParameters;
            writer.write(`export async function ${functionName}(${libSqlArgs}): Promise<${returnType}>`).block(() => {
                (0, codegen_util_1.writeSql)(writer, sql);
                const executeParams = queryParametersWithoutBrackes !== '' ? `{ sql, args: [${queryParametersWithoutBrackes}] }` : 'sql';
                writer.write(`return client.execute(${executeParams})`).newLine();
                if (queryType === 'Select') {
                    writer.indent().write('.then(res => res.rows)').newLine();
                    if (multipleRowsResult) {
                        writer.indent().write(`.then(rows => rows.map(row => mapArrayTo${resultTypeName}(row)));`);
                    }
                    else {
                        writer.indent().write(`.then(rows => rows.length > 0 ? mapArrayTo${resultTypeName}(rows[0]) : null);`);
                    }
                }
                if (queryType === 'Insert') {
                    if (returning) {
                        writer.indent().write('.then(res => res.rows)').newLine();
                        writer.indent().write(`.then(rows => mapArrayTo${resultTypeName}(rows[0]));`);
                    }
                }
                if (queryType === 'Update' || queryType === 'Delete' || (queryType === 'Insert' && !returning)) {
                    writer.indent().write(`.then(res => mapArrayTo${resultTypeName}(res));`);
                }
            });
            writer.blankLine();
            if (queryType === 'Select' || returning) {
                writeMapFunction(writer, mapFunctionParams);
            }
            else {
                writeMapFunctionByName(writer, mapFunctionParams);
            }
            return;
        case 'bun:sqlite':
            const bunArgs = 'db: Database' + restParameters;
            if (queryType === 'Select') {
                writer.write(`export function ${functionName}(${bunArgs}): ${returnType}`).block(() => {
                    (0, codegen_util_1.writeSql)(writer, sql);
                    if (multipleRowsResult) {
                        writer.write('return db.prepare(sql)').newLine();
                        writer.indent().write(`.values(${queryParametersWithoutBrackes})`).newLine();
                        writer.indent().write(`.map(data => mapArrayTo${resultTypeName}(data))${multipleRowsResult ? '' : '[0]'};`);
                    }
                    else {
                        writer.write('const res = db.prepare(sql)').newLine();
                        writer.indent().write(`.values(${queryParametersWithoutBrackes});`).newLine();
                        writer.blankLine();
                        writer.write(`return res.length > 0 ? mapArrayTo${resultTypeName}(res[0]) : null;`);
                    }
                });
                writer.blankLine();
                writeMapFunction(writer, mapFunctionParams);
            }
            if (queryType === 'Update' || queryType === 'Delete' || (queryType === 'Insert' && !returning)) {
                writer.write(`export function ${functionName}(${bunArgs}): ${resultTypeName}`).block(() => {
                    (0, codegen_util_1.writeSql)(writer, sql);
                    writer.write('return db.prepare(sql)').newLine();
                    writer.indent().write(`.run(${queryParametersWithoutBrackes}) as ${resultTypeName};`);
                });
            }
            return;
        case 'd1':
            const d1Args = 'db: D1Database' + restParameters;
            writer.write(`export async function ${functionName}(${d1Args}): Promise<${returnType}>`).block(() => {
                (0, codegen_util_1.writeSql)(writer, sql);
                writer.write('return db.prepare(sql)').newLine();
                if (queryParametersWithoutBrackes !== '') {
                    writer.indent().write(`.bind(${queryParametersWithoutBrackes})`).newLine();
                }
                if (queryType === 'Select') {
                    writer.indent().write('.raw({ columnNames: false })').newLine();
                    if (multipleRowsResult) {
                        writer.indent().write(`.then(rows => rows.map(row => mapArrayTo${resultTypeName}(row)));`);
                    }
                    else {
                        writer.indent().write(`.then(rows => rows.length > 0 ? mapArrayTo${resultTypeName}(rows[0]) : null);`);
                    }
                }
                if (queryType === 'Insert' || queryType === 'Update' || queryType === 'Delete') {
                    if (returning) {
                        writer.indent().write('.raw({ columnNames: false })').newLine();
                        writer.indent().write(`.then(rows => rows.map(row => mapArrayTo${resultTypeName}(row))[0]);`);
                    }
                    else {
                        writer.indent().write('.run()').newLine();
                        writer.indent().write(`.then(res => res.meta);`);
                    }
                }
            });
            if (queryType === 'Select' || returning) {
                writer.blankLine();
                writeMapFunction(writer, mapFunctionParams);
            }
            return;
        default:
            return client;
    }
}
function writeMapFunction(writer, params) {
    const { resultTypeName, columns } = params;
    writer.write(`function mapArrayTo${resultTypeName}(data: any) `).block(() => {
        writer.write(`const result: ${resultTypeName} = `).block(() => {
            columns.forEach((col, index) => {
                const separator = index < columns.length - 1 ? ',' : '';
                writer.writeLine(`${col.name}: ${fromDriver(`data[${index}]`, col)}${separator}`);
            });
        });
        writer.writeLine('return result;');
    });
}
function writeMapFunctionByName(writer, params) {
    const { resultTypeName, columns } = params;
    writer.write(`function mapArrayTo${resultTypeName}(data: any) `).block(() => {
        writer.write(`const result: ${resultTypeName} = `).block(() => {
            columns.forEach((col, index) => {
                const separator = index < columns.length - 1 ? ',' : '';
                writer.writeLine(`${col.name}: data.${col.name}${separator}`);
            });
        });
        writer.writeLine('return result;');
    });
}
//# sourceMappingURL=sqlite.js.map