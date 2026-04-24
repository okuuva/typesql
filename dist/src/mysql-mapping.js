"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapper = exports.typesMapping = exports.FlagEnum = void 0;
exports.checkFlag = checkFlag;
exports.convertTypeCodeToMysqlType = convertTypeCodeToMysqlType;
var FlagEnum;
(function (FlagEnum) {
    FlagEnum[FlagEnum["NOT_NULL"] = 1] = "NOT_NULL";
    FlagEnum[FlagEnum["PRI_KEY"] = 2] = "PRI_KEY";
    FlagEnum[FlagEnum["BINARY_FLAG"] = 128] = "BINARY_FLAG";
    FlagEnum[FlagEnum["ENUM_FLAG"] = 256] = "ENUM_FLAG";
    FlagEnum[FlagEnum["SET_FLAG"] = 2048] = "SET_FLAG";
})(FlagEnum || (exports.FlagEnum = FlagEnum = {}));
function convertToTsType(mySqlType) {
    switch (mySqlType) {
        case 'tinyint':
        case 'smallint':
        case 'int':
        case 'float':
        case 'double':
        case 'bigint':
        case 'mediumint':
        case 'year':
            return 'number';
        case 'tinyint[]':
        case 'smallint[]':
        case 'int[]':
        case 'float[]':
        case 'double[]':
        case 'bigint[]':
        case 'mediumint[]':
        case 'year[]':
            return 'number[]';
        case 'varchar':
        case 'varbinary':
        case 'decimal':
        case 'geometry':
            return 'string';
        case 'varchar[]':
        case 'decimal[]':
            return 'string[]';
        case 'timestamp':
        case 'timestamp2':
        case 'date':
        case 'newdate':
        case 'datetime':
        case 'datetime2':
        case 'time':
        case 'time2':
            return 'Date';
        case 'bit':
            return 'boolean';
        case 'bit[]':
            return 'boolean[]';
        case 'json':
            return 'Object';
        case 'null':
            return 'null';
        case 'tinytext':
        case 'mediumtext':
        case 'longtext':
        case 'text':
        case 'binary':
        case 'char':
            return 'string';
        case 'char[]':
            return 'string[]';
        case 'set':
            return 'any';
        case 'tinyblob':
        case 'mediumblob':
        case 'longblob':
        case 'blob':
            return 'Uint8Array';
        default:
            if (mySqlType.startsWith('enum(')) {
                const enumValues = mySqlType.substring(mySqlType.indexOf('(') + 1, mySqlType.indexOf(')'));
                return enumValues.split(',').join(' | ');
            }
            return 'any';
    }
}
function checkFlag(flags, flag) {
    return (flags & flag) !== 0;
}
function convertTypeCodeToMysqlType(typeCode, flags, columnLength) {
    if (flags & FlagEnum.SET_FLAG) {
        return 'set';
    }
    if (flags & FlagEnum.ENUM_FLAG) {
        return 'enum';
    }
    const mappedType = exports.typesMapping[typeCode];
    if (mappedType === 'varchar' && flags & FlagEnum.BINARY_FLAG) {
        return 'varbinary';
    }
    //max column lenght = 255 but the mysql driver return columnLenght=262140 (octet lenght?)
    if (mappedType === 'text' && columnLength === 255 * 4) {
        return 'tinytext';
    }
    //max column lenght = 65535 but the mysql driver return columnLenght=65535 * 4 (octet lenght?)
    if (mappedType === 'text' && columnLength === 65535 * 4) {
        return 'text';
    }
    //max column lenght = 16777215 but the mysql driver return columnLenght=16777215 * 4 (octet lenght?)
    if (mappedType === 'text' && columnLength === 16777215 * 4) {
        return 'mediumtext';
    }
    //max column lenght = 4294967295
    if (mappedType === 'text' && columnLength === 4294967295) {
        return 'longtext';
    }
    return mappedType;
}
exports.typesMapping = {
    0: 'decimal', //deprecated? newdecimal=246
    1: 'tinyint',
    2: 'smallint',
    3: 'int',
    4: 'float',
    5: 'double',
    6: 'null',
    7: 'timestamp',
    8: 'bigint',
    9: 'mediumint',
    10: 'date',
    11: 'time',
    12: 'datetime',
    13: 'year',
    14: 'newdate', //NEWDATE?
    15: 'varchar', //deprecated? newvarchar=253
    16: 'bit',
    17: 'timestamp2', //TIMESTAMP2?
    18: 'datetime2', //DATETIME2?
    19: 'time2', //TIME2?
    245: 'json',
    246: 'decimal', //NEWDECIMAL
    247: 'enum',
    248: 'set',
    249: 'tinytext',
    250: 'mediumtext',
    251: 'longtext',
    252: 'text',
    253: 'varchar', //aka VAR_STRING, VARBINARY
    254: 'binary',
    255: 'geometry'
};
exports.mapper = {
    convertToTsType
};
//# sourceMappingURL=mysql-mapping.js.map