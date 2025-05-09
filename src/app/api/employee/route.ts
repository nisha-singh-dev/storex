import {auth} from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAllEmployees,addEmployee, getEmployeeByEmail } from "@/lib/queries";

//====get employee ========

export const GET = auth(async function GET(req){
    if(!req.auth){
        return NextResponse.json({error:"Unauthorized"},{status : 401})
    }
    console.log("get employee api se ===========",req.auth);

    try{
        const employees = await getAllEmployees();
        return NextResponse.json({employees},{status: 200});
    }catch(error){
        console.error("Error fetching employees:",error);
        return NextResponse.json({error: "Database error"})
    }
})

//=====post employee =========

export const POST = auth(async function POST (req){
    if(!req.auth){
        return NextResponse.json({error:"Unauthorized"},{status : 401})
    }
    console.log("post employee api se ===========",req.auth);

    const {name,email,phone,type,status} = await req.json();
    console.log("name in post req is ",name);

    if(!name || !email || !phone ||!type || !status){
        return NextResponse.json({error:"All fields are required"},{status: 400})
    }

    try{
        const existingemployee = await getEmployeeByEmail(email);
        if(existingemployee){
            return NextResponse.json({error:"employee already exists"},{status: 409})
        }
         if(!req.auth.user){
            return NextResponse.json({error:"Unauthorized"},{status: 401})
        }
        const newemployee = await addEmployee(name,email,phone,type,status,req.auth.user.id);

   
        return NextResponse.json(
            {
              message: "Employee added successfully",
              employee: newemployee
            },
            { status: 201 }
          );
              }catch(err){
        console.error("Database error:",err);
        return NextResponse.json({error:"Database error"},{status: 500});
    }
})


