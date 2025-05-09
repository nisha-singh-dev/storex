import pool from "@/lib/db";
//get all authorized users
export async function getAuthorizedUsers() {
  const result = await pool.query(`SELECT * FROM authorized_users ORDER BY created_at DESC`);
  return result.rows;
}

//get particular authorized user
export async function findAuthorizedUserByEmail(email: string) {
    const { rows } = await pool.query(
      `SELECT * FROM authorized_users WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  }

 //add authorized user 
export async function addAuthorizedUser(email: string, createdBy: string | undefined) {
  const result = await pool.query(
    `INSERT INTO authorized_users (email, created_by) VALUES ($1, $2) RETURNING *`,
    [email, createdBy]
  );
  return result.rows[0];
}

// delete authorized user
export async function deleteAuthorizedUser(userEmail: string, deletedById: string | undefined) {
    const { rows } = await pool.query(
      `UPDATE authorized_users
       SET deleted_at = CURRENT_TIMESTAMP, deleted_by = $2
       WHERE email = $1
       RETURNING *`,
      [userEmail, deletedById]
    );
    return rows[0];
  }
  


  //get all employees 
export async function getAllEmployees() {
    const result = await pool.query(
        `SELECT  
            e.*,  
            COUNT(a.asset_id) AS asset_count  
            FROM employee e  
            LEFT JOIN assigned_asset a ON e.id = a.employee_id  
            GROUP BY e.id  
            ORDER BY e.created_at DESC`
     );
      return result.rows;
}

//get employee by email
export async function getEmployeeByEmail(email : string){
    const {rows} = await pool.query(
        `SELECT * FROM employee WHERE email = $1 and archive_at is null`,
        [email]
    )
    return rows[0] || null;
}

//get employee by id
export async function getEmployeeById(id : string){
    console.log("id in get employee by id is ",id);
    
    const {rows} = await pool.query(
        `SELECT * FROM employee WHERE id = $1 and archive_at is null`,
        [id]
    )
    return rows[0] || null;
}

// add employee
export async function addEmployee(name : string,
    email : string,
    phone : number,
    type : string,
    status : string,
    createdBy : string | undefined
){
    const result = await pool.query(
        `INSERT INTO employee (name,email,phone_no,type,status, created_by) VALUES ($1, $2,$3, $4, $5,$6) RETURNING *`,
        [name,email,phone,type,status, createdBy]
      );
      return result.rows[0];
}

// delete employee 
export async function deleteEmployeeById(id : string,reason : string,deletedBy : string | undefined){
    const {rows} = await pool.query(
        `update employee set archive_at = CURRENT_TIMESTAMP,
        deleted_by = $3, 
        archive_reason = $2
        where id = $1
          RETURNING *`,
        [id, reason,deletedBy]
    )
    return rows[0] || null;
}

// update employee
interface EmployeeUpdateData {
    name?: string;
    email?: string;
    phone?: number;
    type?: string;
    status?: string;
}
export async function updateEmployeeById(id: string, data: EmployeeUpdateData) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            fields.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }
    }

    if (fields.length === 0) {
        throw new Error("No valid fields to update");
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
        UPDATE employee
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING *
    `;

    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
}

// restore employee
export async function restoreEmployeeById(id: string) {
    const { rows } = await pool.query(
        `UPDATE employee
         SET archive_at = NULL, deleted_by = NULL, archive_reason = NULL
         WHERE id = $1
         RETURNING *`,
        [id]
    );
    return rows[0] || null;
}

// get all assets
export async function getAllAssets() {
    const result = await pool.query(
        `SELECT * FROM assets ORDER BY created_at DESC`
    )
    return result.rows;
}

//insert assets

//get asset by id
export async function getAssetById(id: string){
    console.log("id in get asset  by id is ",id);
    
    const {rows} = await pool.query(
        `SELECT * FROM assets WHERE id = $1 and deleted_at is null`,
        [id]
    )
    return rows[0] || null;
}
//delete asset by id
export async function deleteAssetById(id: string,reason: string, deletedBy: string| undefined){
    const {rows} = await pool.query(
        `update assets set deleted_at = CURRENT_TIMESTAMP,
        deleted_by = $3, 
        archive_reason = $2
        where id = $1
          RETURNING *`,
        [id, reason,deletedBy]
    )
    return rows[0] || null;
}   

// assign asset
export async function assignAsset(
    asset_id: string,
    employee_id: string,
    assigned_by: string | undefined,
    assigned_date: Date
  ) {
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      const insertResult = await client.query(
        `INSERT INTO assigned_asset (asset_id, employee_id, assigned_by, assigned_date) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [asset_id, employee_id, assigned_by, assigned_date]
      );
  
      await client.query(
        `UPDATE assets SET status = 'assign' WHERE id = $1`,
        [asset_id]
      );
  
      await client.query('COMMIT');
      return insertResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
// export async function assignAsset(asset_id: string, employee_id: string, assigned_by: string | undefined, assigned_date: Date) {
//     const result = await pool.query(
//         `INSERT INTO assigned_asset (asset_id, employee_id, assigned_by, assigned_date) 
//          VALUES ($1, $2, $3, $4) 
//          RETURNING *`,
//         [asset_id, employee_id, assigned_by, assigned_date]
//     );
//     return result.rows[0];
// }