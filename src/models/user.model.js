"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const argon2_1 = __importDefault(require("argon2"));
const PEPPER = process.env.PEPPER_KEY;
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        sparse: true,
        unique: true,
        trim: true,
    },
    authProvider: {
        type: String,
        enum: ["credentials", "google", "github", "facebook", "apple"],
        default: "credentials",
    },
    emailVerified: {
        type: Date
    },
    password: {
        type: String,
    },
    mobile: {
        type: String,
        sparse: true,
        unique: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
    },
    bio: {
        type: String,
        default: "",
    },
    profile_image: {
        type: String,
        default: "",
    },
    isPrivate: {
        type: Boolean,
        default: true,
    },
    followersCount: {
        type: Number,
        default: 0,
    },
    followingCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const pepperedPassword = this.password + PEPPER;
        this.password = await argon2_1.default.hash(pepperedPassword, {
            type: argon2_1.default.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1,
        });
    }
    next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
    const pepperedPassword = password + PEPPER;
    console.log(pepperedPassword);
    return await argon2_1.default.verify(this.password, pepperedPassword);
};
const User = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
exports.default = User;
