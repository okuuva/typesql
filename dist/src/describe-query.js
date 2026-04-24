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
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeSql = describeSql;
exports.verifyNotInferred = verifyNotInferred;
exports.parseSql = parseSql;
exports.preprocessSql = preprocessSql;
exports.hasAnnotation = hasAnnotation;
const parse_1 = require("./mysql-query-analyzer/parse");
const Either_1 = require("fp-ts/lib/Either");
const queryExectutor_1 = require("./queryExectutor");
function describeSql(dbSchema, sql) {
    const { sql: processedSql, namedParameters } = preprocessSql(sql, 'mysql');
    const paramNames = namedParameters.map(param => param.paramName);
    const queryInfo = (0, parse_1.extractQueryInfo)(sql, dbSchema);
    if (queryInfo.kind === 'Select') {
        const parametersDef = queryInfo.parameters.map((paramInfo, paramIndex) => {
            const paramDef = {
                name: (paramNames === null || paramNames === void 0 ? void 0 : paramNames[paramIndex]) ? paramNames[paramIndex] : `param${paramIndex + 1}`,
                columnType: paramInfo.type,
                notNull: paramInfo.notNull
            };
            return paramDef;
        });
        const schemaDef = {
            sql: processedSql,
            queryType: 'Select',
            multipleRowsResult: queryInfo.multipleRowsResult,
            columns: queryInfo.columns,
            parameters: parametersDef
        };
        if (queryInfo.orderByColumns && queryInfo.orderByColumns.length > 0) {
            schemaDef.orderByColumns = queryInfo.orderByColumns;
        }
        if (queryInfo.nestedResultInfo) {
            schemaDef.nestedResultInfo = queryInfo.nestedResultInfo;
        }
        if (queryInfo.dynamicQuery) {
            schemaDef.dynamicSqlQuery = queryInfo.dynamicQuery;
        }
        return schemaDef;
    }
    if (queryInfo.kind === 'Insert') {
        const resultColumns = [
            {
                name: 'affectedRows',
                type: 'int',
                notNull: true
            },
            {
                name: 'insertId',
                type: 'int',
                notNull: true
            }
        ];
        const parameters = paramNames ? addParameterNames(queryInfo.parameters, paramNames) : queryInfo.parameters;
        const verifiedParameters = parameters.map((param) => (Object.assign(Object.assign({}, param), { columnType: verifyNotInferred(param.columnType) })));
        const schemaDef = {
            sql: processedSql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: resultColumns,
            parameters: verifiedParameters
        };
        return schemaDef;
    }
    if (queryInfo.kind === 'Update') {
        const resultColumns = [
            {
                name: 'affectedRows',
                type: 'int',
                notNull: true
            }
        ];
        const schemaDef = {
            sql: processedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: resultColumns,
            parameters: queryInfo.parameters,
            data: queryInfo.data
        };
        return schemaDef;
    }
    if (queryInfo.kind === 'Delete') {
        const resultColumns = [
            {
                name: 'affectedRows',
                type: 'int',
                notNull: true
            }
        ];
        const parameters = paramNames ? addParameterNames(queryInfo.parameters, paramNames) : queryInfo.parameters;
        const schemaDef = {
            sql: processedSql,
            queryType: 'Delete',
            multipleRowsResult: false,
            columns: resultColumns,
            parameters
        };
        return schemaDef;
    }
    throw Error('Not supported!');
}
function addParameterNames(parameters, namedParameters) {
    return parameters.map((param, paramIndex) => {
        const paramDef = Object.assign(Object.assign({}, param), { name: (namedParameters === null || namedParameters === void 0 ? void 0 : namedParameters[paramIndex]) ? namedParameters[paramIndex] : param.name });
        return paramDef;
    });
}
function verifyNotInferred(type) {
    if (type === '?' || type === 'any')
        return 'any';
    if (type === 'number')
        return 'double';
    return type;
}
function parseSql(client, sql) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sql: processedSql } = preprocessSql(sql, 'mysql');
        const explainResult = yield (0, queryExectutor_1.explainSql)(client.client, processedSql);
        if ((0, Either_1.isLeft)(explainResult)) {
            return explainResult;
        }
        const dbSchema = yield (0, queryExectutor_1.loadMysqlSchema)(client.client, client.schema);
        if (dbSchema.isErr()) {
            return (0, Either_1.left)(dbSchema.error);
        }
        try {
            const result = describeSql(dbSchema.value, sql);
            return (0, Either_1.right)(result);
        }
        catch (e) {
            const InvalidSqlError = {
                name: 'Invalid SQL',
                description: e.message
            };
            return (0, Either_1.left)(InvalidSqlError);
        }
    });
}
//http://dev.mysql.com/doc/refman/8.0/en/identifiers.html
//Permitted characters in unquoted identifiers: ASCII: [0-9,a-z,A-Z$_] (basic Latin letters, digits 0-9, dollar, underscore)
function preprocessSql(sql, dialect) {
    const namedParamRegex = /:[a-zA-Z$_][a-zA-Z\d$_]*/g;
    const tempSql = sql.replace(/::([a-zA-Z0-9_]+)/g, (_, type) => `/*TYPECAST*/${type}`);
    const lines = tempSql.split('\n');
    let newSql = '';
    const paramMap = {};
    const namedParameters = [];
    let paramIndex = 1;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (!line.trim().startsWith('--')) {
            // Extract named params (:paramName)
            const matches = [...line.matchAll(namedParamRegex)];
            if (dialect === 'postgres') {
                const positionalParamRegex = /\$(\d+)/g;
                const positionalMatches = [...line.matchAll(positionalParamRegex)];
                for (const match of positionalMatches) {
                    const paramNumber = parseInt(match[1], 10);
                    namedParameters.push({
                        paramName: `param${paramNumber}`,
                        paramNumber: paramNumber
                    });
                }
            }
            for (const match of matches) {
                const fullMatch = match[0];
                const paramName = fullMatch.slice(1);
                if (!paramMap[paramName]) {
                    paramMap[paramName] = paramIndex++;
                }
                namedParameters.push({ paramName, paramNumber: paramMap[paramName] });
            }
            if (dialect === 'postgres') {
                // Replace :paramName with $number
                for (const param of Object.keys(paramMap)) {
                    const regex = new RegExp(`:${param}\\b`, 'g');
                    line = line.replace(regex, `$${paramMap[param]}`);
                }
            }
            else {
                // For mysql/sqlite, replace :paramName with '?'
                line = line.replace(namedParamRegex, '?');
            }
        }
        newSql += line;
        if (i !== lines.length - 1)
            newSql += '\n';
    }
    newSql = newSql.replace(/\/\*TYPECAST\*\/([a-zA-Z0-9_]+)/g, (_, type) => `::${type}`);
    return {
        sql: newSql,
        namedParameters,
    };
}
//https://stackoverflow.com/a/1695647
function hasAnnotation(sql, annotation) {
    const regex = `-- ${annotation}`;
    return sql.match(new RegExp(regex)) != null;
}
//# sourceMappingURL=describe-query.js.map