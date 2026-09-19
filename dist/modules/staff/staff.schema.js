"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staff = exports.users = void 0;
// Re-export users table and types as staff to maintain single source of truth in 'users' table
var guests_schema_js_1 = require("../guests/guests.schema.js");
Object.defineProperty(exports, "users", { enumerable: true, get: function () { return guests_schema_js_1.users; } });
Object.defineProperty(exports, "staff", { enumerable: true, get: function () { return guests_schema_js_1.users; } });
