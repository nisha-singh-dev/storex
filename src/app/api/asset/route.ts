import {auth} from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAllAssets} from "@/lib/queries";
import pool from "@/lib/db";

//get api===============

export const GET = auth(async function GET(req){
    if(!req.auth){
        return NextResponse.json({error:"Unauthorized"},{status : 401})
    }
    console.log("get employee api se ========",req.auth);

    try{
        const assets = await getAllAssets();
        return NextResponse.json({assets},{status: 200});
    }catch(error){
        console.error("Error fetching employees:",error);
        return NextResponse.json({error: "Database error"})
    }
})

// post assets api===========

enum AssetType {
  Laptop = 'laptop',
  Pendrive = 'pendrive',
  Harddisk = 'harddisk',
  Monitor = 'monitor',
  Mobile = 'mobile',
  Sim = 'sim',
  Accessories = 'accessories'
}

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const {
      brand, model, serial_no, type, status, purchased_date, warranty_expiry_date, owned_by, client_name,
      series, processor, ram, storage, os, screen_resolution, charger,
      os_type, imei_1, imei_2,
      sim_no, phone_no,
      acc_type, remark, capacity
    } = data;

    if (!brand || !model || !type) {
      return NextResponse.json({ error: 'All required asset fields must be filled' }, { status: 400 });
    }

    const createdBy = req.auth.user?.id;
    if (!createdBy) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetResult = await pool.query(
      `INSERT INTO assets 
      (brand, model, serial_no, type, status, purchased_date, warranty_expiry_date, created_by, owned_by, client_name) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        brand,
        model,
        serial_no,
        type,
        status,
        purchased_date,
        warranty_expiry_date,
        createdBy,
        owned_by,
        client_name
      ]
    );

    const asset = assetResult.rows[0];
    const assetId = asset.id;

    switch (type) {
      case AssetType.Laptop:
        if (!series || !processor || !ram || !storage) {
          return NextResponse.json({ error: 'Missing laptop-specific fields' }, { status: 400 });
        }
        await pool.query(
          `INSERT INTO laptop (asset_id, series, processor, ram, storage, os, screen_resolution, charger) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [assetId, series, processor, ram, storage, os, screen_resolution, charger]
        );
        break;

      case AssetType.Pendrive:
        await pool.query(
          `INSERT INTO pendrive (asset_id, storage) VALUES ($1, $2)`,
          [assetId, storage]
        );
        break;

      case AssetType.Harddisk:
        await pool.query(
          `INSERT INTO harddisk (asset_id, storage) VALUES ($1, $2)`,
          [assetId, storage]
        );
        break;

      case AssetType.Monitor:
        await pool.query(
          `INSERT INTO monitor (asset_id, screen_resolution) VALUES ($1, $2)`,
          [assetId, screen_resolution]
        );
        break;

      case AssetType.Mobile:
        await pool.query(
          `INSERT INTO mobile (asset_id, os_type, imei_1, imei_2, ram) VALUES ($1, $2, $3, $4, $5)`,
          [assetId, os_type, imei_1, imei_2, ram]
        );
        break;

      case AssetType.Sim:
        await pool.query(
          `INSERT INTO sim (asset_id, sim_no, phone_no) VALUES ($1, $2, $3)`,
          [assetId, sim_no, phone_no]
        );
        break;

      case AssetType.Accessories:
        await pool.query(
          `INSERT INTO accessories (asset_id, acc_type, remark, capacity) VALUES ($1, $2, $3, $4)`,
          [assetId, acc_type, remark, capacity]
        );
        break;

      default:
        return NextResponse.json({ error: `Unsupported asset type: ${type}` }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Asset and related type data added successfully', asset },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/assets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
