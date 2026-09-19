// Re-export users table and types as staff to maintain single source of truth in 'users' table
export {
  users,
  users as staff,
  type User as Staff,
  type NewUser as NewStaff,
} from "../guests/guests.schema.js";

