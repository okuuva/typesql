import type { InferType } from '../mysql-mapping';
import type { Constraint, SubstitutionHash, Type } from './types';
export declare function unify(constraints: Constraint[], substitutions: SubstitutionHash): void;
export declare function substitute(type: Type, substitutions: SubstitutionHash): Type;
export declare function unionTypeResult(type1: InferType, type2: InferType): InferType;
//# sourceMappingURL=unify.d.ts.map