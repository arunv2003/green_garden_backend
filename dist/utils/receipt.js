"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReceiptNumber = void 0;
const generateReceiptNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `GG-${year}-${random}`;
};
exports.generateReceiptNumber = generateReceiptNumber;
