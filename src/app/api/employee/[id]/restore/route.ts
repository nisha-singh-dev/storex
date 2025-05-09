import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { restoreEmployeeById} from "@/lib/queries";

export const PATCH = auth(async function PATCH(req, { params }) {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await params;
    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    try {
        // const employee = await getEmployeeById(id);
        // if (!employee) {
        //     return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        // }

        const restoreEmployee = await restoreEmployeeById(id);
        return NextResponse.json(restoreEmployee, { status: 200 });
    } catch (error) {
        console.error("Error updating employee:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
});