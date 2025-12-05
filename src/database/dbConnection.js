"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connection = {};
async function dbConnect() {
    if (connection.isConnected) {
        console.log("\x1b[32m%s\x1b[0m", "✅ Database is already connected!");
        return;
    }
    try {
        const db = await mongoose_1.default.connect(process.env.MONGODB_URI);
        connection.isConnected = db.connections[0].readyState;
        console.log("\x1b[32m%s\x1b[0m", "✅ Database successfully connected!");
    }
    catch (error) {
        console.error("\x1b[31m%s\x1b[0m", "❌ Database connection failed:", error);
        process.exit(1);
    }
}
exports.default = dbConnect;
