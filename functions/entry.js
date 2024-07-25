export default async function handler(req, res) {
    
    console.log(req.query)
    // app.js
    try {
      const postgres = require("postgres");
      require("dotenv").config();

      let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
    

      const sql = postgres({
        host: PGHOST,
        database: PGDATABASE,
        username: PGUSER,
        password: PGPASSWORD,
        port: 5432,
        ssl: "require",
        connection: {
          options: `project=${ENDPOINT_ID}`,
        },
      });
    //console.log(req)
      const uid = req.query.uid;
      // console.log(payload)
    
      const data = await sql`
    SELECT changes_type, timestamp FROM webhook_data WHERE data -> 'data' -> 'entry' -> 'uid' ? ${uid}

  `;
      res.status(200).send(data)
    } catch (error) {
      console.error("Error fetching webhook data:", error);
      res
        .status(500)
        .send({ message: "Error fetching webhook data", error: error });
    }
  
}
