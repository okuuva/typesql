import type { Database } from 'better-sqlite3';
export type Nested02Result = {
    user_id: number;
    user_name: string;
    post_id: number;
    post_title: string;
    post_body: string;
    role_id: number;
    role: string;
    comment_id: number;
    comment: string;
};
export declare function nested02(db: Database): Nested02Result[];
export type Nested02NestedUsers = {
    user_id: number;
    user_name: string;
    posts: Nested02NestedPosts[];
    roles: Nested02NestedRoles[];
};
export type Nested02NestedPosts = {
    post_id: number;
    post_title: string;
    post_body: string;
    comments: Nested02NestedComments[];
};
export type Nested02NestedRoles = {
    role_id: number;
    role: string;
};
export type Nested02NestedComments = {
    comment_id: number;
    comment: string;
};
export declare function nested02Nested(db: Database): Nested02NestedUsers[];
//# sourceMappingURL=nested02.d.ts.map