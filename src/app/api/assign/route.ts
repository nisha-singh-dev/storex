import {auth} from "@/lib/auth";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { assignAsset } from "@/lib/queries";

export const POST = auth(async function POST(req) {
    if(!req.auth) {
        return NextResponse.json({error:"Unauthorized"},{status : 401})
    }
    const {asset_id,employee_id,assigned_date} = await req.json();
    console.log("asset_id in post req is ",asset_id);
    if(!asset_id || !employee_id){
        return NextResponse.json({error:"All fields are required"},{status: 400})
    }
    const client = await pool.connect();
    if(!req.auth.user){
        return NextResponse.json({error:"Unauthorized"},{status: 401})
    }
    try{
        const client = await pool.connect();
        await client.query('BEGIN');
        const newAssignment = await assignAsset(asset_id, employee_id, req.auth.user.id,assigned_date);
        await client.query('COMMIT');
        return NextResponse.json({message: "Asset assigned successfully", assignment: newAssignment}, {status: 201});
    } catch (error) {
        console.error("Error assigning asset:", error);
        await client.query('ROLLBACK');
        return NextResponse.json({error: "Database error"}, {status: 500});
    }
})