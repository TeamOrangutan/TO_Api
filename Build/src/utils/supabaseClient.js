"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// utils/supabaseClient.ts
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
exports.default = supabase;
