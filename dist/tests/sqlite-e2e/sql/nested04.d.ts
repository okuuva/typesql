import type { Database } from 'better-sqlite3';
export type Nested04Result = {
    surveyId: number;
    surveyName: string;
    participantId: number;
    userId: number;
    userName: string;
};
export declare function nested04(db: Database): Nested04Result[];
export type Nested04NestedSurveys = {
    surveyId: number;
    surveyName: string;
    participants: Nested04NestedParticipants[];
};
export type Nested04NestedParticipants = {
    participantId: number;
    users: Nested04NestedUsers;
};
export type Nested04NestedUsers = {
    userId: number;
    userName: string;
};
export declare function nested04Nested(db: Database): Nested04NestedSurveys[];
//# sourceMappingURL=nested04.d.ts.map