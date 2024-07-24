export default async function handler(req, res) {
  if (req.method == "POST") {
    // app.js
    const postgres = require("postgres");
    require("dotenv").config();

    let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
    try {
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

      const payload = req.body.body;
      const httpRequestText = JSON.stringify(req.headers);
      const changesIn = payload.module;
      const changesType = payload.event;
      console.log(payload, httpRequestText, changesIn, changesType);
      const query = `
        INSERT INTO webhook_data (data, http_request, changes_in, changes_type)
        VALUES ($1, $2, $3, $4)
    `;
      await sql`
    INSERT INTO webhook_data (data, http_request, changes_in, changes_type)
    VALUES (${payload}, ${httpRequestText}, ${changesIn}, ${changesType})
  `;
      res.status(200).send({ message: "Webhook data stored successfully" });
    } catch (error) {
      console.error("Error storing webhook data:", error);
      res
        .status(500)
        .send({ message: "Error storing webhook data", error: error });
    }
  }
}
