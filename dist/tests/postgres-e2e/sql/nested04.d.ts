import pg from 'pg';
export type Nested04Result = {
    surveyid: number;
    surveyname: string;
    participantid: number;
    userid: number;
    username: string;
};
export type Nested04NestedSurveys = {
    surveyid: number;
    surveyname: string;
    participants: Nested04NestedParticipants[];
};
export type Nested04NestedParticipants = {
    participantid: number;
    users: Nested04NestedUsers;
};
export type Nested04NestedUsers = {
    userid: number;
    username: string;
};
export declare function nested04(client: pg.Client | pg.Pool | pg.PoolClient): Promise<Nested04Result[]>;
export declare function nested04Nested(client: pg.Client | pg.Pool | pg.PoolClient): Promise<Nested04NestedSurveys[]>;
//# sourceMappingURL=nested04.d.ts.map