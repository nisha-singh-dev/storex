import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Update the import path if needed
import { getEmployeeById, deleteEmployeeById, updateEmployeeById } from "@/lib/queries"; // Adjust based on your project structure

// ========== DELETE employee ===========
export const DELETE = auth(async function DELETE(req, { params }) {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const body = await req.json();
    const reason = body.reason;
        try {
        const employee = await getEmployeeById(id);
        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }
        if(!req.auth.user){
            return NextResponse.json({error:"Unauthorized"},{status: 401})
        }
        await deleteEmployeeById(id,reason,req.auth.user.id);
        return NextResponse.json({ message: "Employee deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting employee:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
});

// ========== PATCH employee ===========

export const PATCH = auth(async function PATCH(req, { params }) {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await params;
    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const data = await req.json();

    try {
        const employee = await getEmployeeById(id);
        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        const updatedEmployee = await updateEmployeeById(id, data);
        return NextResponse.json(updatedEmployee, { status: 200 });
    } catch (error) {
        console.error("Error updating employee:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
});

