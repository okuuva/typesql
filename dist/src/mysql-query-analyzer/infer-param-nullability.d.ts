import { SimpleExprParamMarkerContext, type ExprContext, type InsertQueryExpressionContext, type SelectStatementContext, type QueryExpressionContext } from '@wsporto/typesql-parser/mysql/MySQLParser';
import { RuleContext } from '@wsporto/typesql-parser';
export declare function inferParamNullabilityQuery(queryContext: SelectStatementContext | InsertQueryExpressionContext): boolean[];
export declare function inferParamNullabilityQueryExpression(queryExpression: QueryExpressionContext): boolean[];
export declare function inferParamNullability(exprContext: ExprContext): boolean[];
export declare function inferParameterNotNull(param: SimpleExprParamMarkerContext): boolean;
export declare function getParentContext(ctx: RuleContext | undefined, parentContext: any): RuleContext | undefined;
//# sourceMappingURL=infer-param-nullability.d.ts.map