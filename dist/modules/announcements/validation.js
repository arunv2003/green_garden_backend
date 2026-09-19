"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnnouncementSchema = void 0;
const zod_1 = require("zod");
exports.createAnnouncementSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
    description: zod_1.z.string().min(5, "Description must be at least 5 characters"),
    attachmentUrl: zod_1.z.string().optional(),
    publishDate: zod_1.z.string().default(() => new Date().toISOString().slice(0, 10)),
    expiryDate: zod_1.z.string().optional(),
});
