import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAuthorizedUsers,findAuthorizedUserByEmail,
    addAuthorizedUser,deleteAuthorizedUser
} from "@/lib/queries";

export const GET = auth(async function GET(req) {
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("get api se ===========",req.auth);
  
    try {
      const users = await getAuthorizedUsers();
      return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
      console.error("Error fetching authorized users:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  });



/// post api ==========
export const POST = auth(async function POST(req) {
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("post api se ==========",req.auth);
  
    const { email } = await req.json();
    console.log("email in post req is ",email);
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
  
    try {
      const existingUser = await findAuthorizedUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: "User already authorized" }, { status: 409 });
      }
  
      if (!req.auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const newUser = await addAuthorizedUser(email, req.auth.user.id);
      return NextResponse.json({ user: newUser }, { status: 201 });
    } catch (err) {
      console.error("Database error:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  });


  // delete api ================changes requireddd

  export const DELETE = auth(async function DELETE(req) {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.log("delete  api se ==========",req.auth);
  
    const { email } = await req.json();
  
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
  
    try {
        if (!req.auth.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
      const deletedUser = await deleteAuthorizedUser(email, req.auth.user.id);
      if (!deletedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      return NextResponse.json({ user: deletedUser }, { status: 200 });
    } catch (err) {
      console.error("Error during soft delete:", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  });