//delete api
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; 
import { getAssetById,deleteAssetById } from "@/lib/queries";
import pool from "@/lib/db";

//patch req for updating asset
export const PATCH = auth(async function PATCH(req, { params }) {
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }
  
    const data = await req.json();
  
    const {
      brand, model, serial_no, type, status, purchased_date, warranty_expiry_date,
      owned_by, client_name,
      series, processor, ram, storage, os, screen_resolution, charger,
      os_type, imei_1, imei_2,
      sim_no, phone_no,
      acc_type, remark, capacity
    } = data;
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      const { rows } = await client.query('SELECT * FROM assets WHERE id = $1', [id]);
      const asset = rows[0];
      if (!asset) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
  
      const fields = [];
      const values = [];
      let i = 1;
  
      const fieldMap = {
        brand, model, serial_no, type, status,
        purchased_date, warranty_expiry_date, owned_by, client_name
      };
  
      for (const [key, value] of Object.entries(fieldMap)) {
        if (value !== undefined) {
          fields.push(`${key} = $${i}`);
          values.push(value);
          i++;
        }
      }
  
      if (fields.length > 0) {
        await client.query(
          `UPDATE assets SET ${fields.join(', ')} WHERE id = $${i}`,
          [...values, id]
        );
      }
  
      if (type && type !== asset.type) {
        await client.query(`DELETE FROM ${asset.type} WHERE asset_id = $1`, [id]);
  
        if (type === 'laptop') {
          if (!series || !processor || !ram || !storage) {
            throw new Error('Missing required laptop-specific fields');
          }
          await client.query(
            `INSERT INTO laptop (asset_id, series, processor, ram, storage, os, screen_resolution, charger)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, series, processor, ram, storage, os ?? null, screen_resolution ?? null, charger ?? null]
          );
        } else if (type === 'pendrive') {
          await client.query(`INSERT INTO pendrive (asset_id, storage) VALUES ($1, $2)`, [id, storage]);
        } else if (type === 'harddisk') {
          await client.query(`INSERT INTO harddisk (asset_id, storage) VALUES ($1, $2)`, [id, storage]);
        } else if (type === 'monitor') {
          await client.query(`INSERT INTO monitor (asset_id, screen_resolution) VALUES ($1, $2)`, [id, screen_resolution]);
        } else if (type === 'mobile') {
          await client.query(
            `INSERT INTO mobile (asset_id, os_type, imei_1, imei_2, ram) VALUES ($1, $2, $3, $4, $5)`,
            [id, os_type, imei_1, imei_2, ram]
          );
        } else if (type === 'sim') {
          await client.query(`INSERT INTO sim (asset_id, sim_no, phone_no) VALUES ($1, $2, $3)`, [id, sim_no, phone_no]);
        } else if (type === 'accessories') {
          await client.query(
            `INSERT INTO accessories (asset_id, acc_type, remark, capacity) VALUES ($1, $2, $3, $4)`,
            [id, acc_type, remark, capacity]
          );
        }
      }
  
      await client.query('COMMIT');
      return NextResponse.json({ message: 'Asset updated successfully' });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Transaction failed:", error);
      return NextResponse.json({ error: "Database error", details: error }, { status: 500 });
  
    } finally {
      client.release();
    }
  });
  

export const DELETE = auth(async function DELETE(req, { params }) {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    // console.log("id in params in delete api",id);
    
    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const {reason} = await req.json();
    // console.log("reason",reason);
    
    try{
        const asset = await getAssetById(id);
        if(!asset){
            return NextResponse.json({error: "Asset not found"},{status: 404})
        }
        if(!req.auth.user){
            return NextResponse.json({error: "Unauthorized"},{status: 401})
        }
        await deleteAssetById(id,reason,req.auth.user.id,);
        return NextResponse.json({message: "Asset deleted successfully!!"})
    }catch(error){
        console.error("Error in deleting asset ",error);
        return NextResponse.json({error: "Database error"})
        
    }
})