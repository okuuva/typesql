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
const node_assert_1 = __importDefault(require("node:assert"));
const pg_1 = __importDefault(require("pg"));
const sql_1 = require("./sql");
describe('postgres-nested-result', () => {
    const pool = new pg_1.default.Pool({
        connectionString: 'postgres://postgres:password@127.0.0.1:5432/postgres'
    });
    it('nested01 - users -> posts', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.nested01Nested)(pool);
        const expectedResult = [
            {
                user_id: 1,
                user_name: 'user1',
                posts: [
                    {
                        post_id: 1,
                        post_title: 'title1',
                    },
                    {
                        post_id: 2,
                        post_title: 'title2',
                    },
                    {
                        post_id: 3,
                        post_title: 'title3',
                    }
                ]
            },
            // { //INNER JOIN
            // 	user_id: 2,
            // 	user_name: 'user2',
            // 	posts: []
            // },
            {
                user_id: 3,
                user_name: 'user3',
                posts: [
                    {
                        post_id: 4,
                        post_title: 'title4',
                    },
                    {
                        post_id: 5,
                        post_title: 'title5',
                    }
                ],
            },
            {
                user_id: 4,
                user_name: 'user4',
                posts: [
                    {
                        post_id: 6,
                        post_title: 'title6',
                    }
                ]
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('nested02 - users -> posts -> roles -> comments', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.nested02Nested)(pool);
        const expectedResult = [
            {
                user_id: 1,
                user_name: 'user1',
                posts: [
                    {
                        post_id: 1,
                        post_title: 'title1',
                        post_body: 'body1',
                        comments: [
                            {
                                comment_id: 1,
                                comment: 'comment1'
                            },
                            {
                                comment_id: 2,
                                comment: 'comment2'
                            }
                        ]
                    },
                    // {
                    // 	post_id: 2,
                    // 	post_title: 'title2',
                    // 	post_body: 'body2',
                    // 	comments: []
                    // },
                    {
                        post_id: 3,
                        post_title: 'title3',
                        post_body: 'body3',
                        comments: [
                            {
                                comment_id: 3,
                                comment: 'comment3'
                            }
                        ]
                    }
                ],
                roles: [
                    {
                        role_id: 1,
                        role: 'role1'
                    },
                    {
                        role_id: 2,
                        role: 'role2'
                    }
                ]
            },
            {
                user_id: 3,
                user_name: 'user3',
                posts: [
                    {
                        post_id: 4,
                        post_title: 'title4',
                        post_body: 'body4',
                        comments: [
                            {
                                comment_id: 4,
                                comment: 'comment4'
                            },
                            {
                                comment_id: 5,
                                comment: 'comment5'
                            },
                            {
                                comment_id: 6,
                                comment: 'comment6'
                            }
                        ]
                    },
                    {
                        post_id: 5,
                        post_title: 'title5',
                        post_body: 'body5',
                        comments: [
                            {
                                comment_id: 7,
                                comment: 'comment7'
                            }
                        ]
                    }
                ],
                roles: [
                    {
                        role_id: 4,
                        role: 'role4'
                    }
                ]
            },
            {
                user_id: 4,
                user_name: 'user4',
                posts: [
                    {
                        post_id: 6,
                        post_title: 'title6',
                        post_body: 'body6',
                        comments: [
                            {
                                comment_id: 8,
                                comment: 'comment8'
                            }
                        ]
                    }
                ],
                roles: [
                    {
                        role_id: 5,
                        role: 'role5'
                    },
                    {
                        role_id: 6,
                        role: 'role6'
                    }
                ]
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('nested03 - client1', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.nested03Nested)(pool, {
            param1: 1
        });
        const expectedResult = [
            {
                id: 1,
                a1: {
                    id: 1,
                    address: 'address1'
                },
                a2: {
                    id: 2,
                    address: 'address2'
                }
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('nested03 - client3', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.nested03Nested)(pool, {
            param1: 3
        });
        const expectedResult = [
            {
                id: 3,
                a1: {
                    id: 3,
                    address: 'address3'
                },
                a2: null
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('nested04 - surveys -> participants -> users (with join table)', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.nested04Nested)(pool);
        const expectedResult = [
            {
                surveyid: 1,
                surveyname: 's1',
                participants: [
                    {
                        participantid: 1,
                        users: {
                            userid: 1,
                            username: 'user1'
                        }
                    }
                ]
            },
            {
                surveyid: 2,
                surveyname: 's2',
                participants: [
                    {
                        participantid: 2,
                        users: {
                            userid: 1,
                            username: 'user1'
                        }
                    },
                    {
                        participantid: 3,
                        users: {
                            userid: 3,
                            username: 'user3'
                        }
                    }
                ]
            },
            {
                surveyid: 3,
                surveyname: 's3',
                participants: [
                    {
                        participantid: 4,
                        users: {
                            userid: 3,
                            username: 'user3'
                        }
                    },
                    {
                        participantid: 6,
                        users: {
                            userid: 4,
                            username: 'user4'
                        }
                    }
                ]
            },
            {
                surveyid: 4,
                surveyname: 's4',
                participants: [
                    {
                        participantid: 5,
                        users: {
                            userid: 3,
                            username: 'user3'
                        }
                    }
                ]
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('nested04 - surveys -> participants -> users (without join table)', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.nested04WithoutJoinTableNested)(pool);
        const expectedResult = [
            {
                id: 1,
                name: 's1',
                users: [
                    {
                        id: 1,
                        name: 'user1',
                        email: null
                    }
                ]
            },
            {
                id: 2,
                name: 's2',
                users: [
                    {
                        id: 1,
                        name: 'user1',
                        email: null
                    },
                    {
                        id: 3,
                        name: 'user3',
                        email: null
                    }
                ]
            },
            {
                id: 3,
                name: 's3',
                users: [
                    {
                        id: 3,
                        name: 'user3',
                        email: null
                    },
                    {
                        id: 4,
                        name: 'user4',
                        email: null
                    }
                ]
            },
            {
                id: 4,
                name: 's4',
                users: [
                    {
                        id: 3,
                        name: 'user3',
                        email: null
                    }
                ]
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
});
//# sourceMappingURL=nested-result.test.js.map