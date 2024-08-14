export default async function handler(req, res) {
  console.log(req.query);
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

    // //console.log(req)
    const uid = req.query.uid;
    let result = [];
    let stack = [{ uid, parentUid: null }];

    while (stack.length > 0) {
      const { uid: currentUid, parentUid } = stack.pop();
      let currentData = await sql`
        SELECT * FROM webhook_data
        WHERE data -> 'data' -> 'entry' ->> 'uid' = ${currentUid}
        ORDER BY timestamp DESC
        LIMIT 1
      `;

      if (currentData.length > 0) {
        currentData = currentData[0];
        result.push({ uid : currentUid, parentUid });
        let references=[];
        for (const [key, value] of Object.entries(currentData.data.data.entry)) {
          if (
            value &&
            Array.isArray(value) &&
            value.length === 1 &&
            typeof value[0] === "object" &&
            "uid" in value[0] &&
            "_content_type_uid" in value[0]
          ) {
            references.push(value[0])
          }
        }
        console.log(references)
        // const references =
        //   currentData.data &&
        //   currentData.data.data &&
        //   currentData.data.data.entry &&
        //   currentData.data.data.entry.reference;

        if (references && references.length > 0) {
          for (const reference of references) {
            const referenceUid = reference.uid;
            if (referenceUid) {
              stack.push({ uid: referenceUid, parentUid: currentUid });
            }
          }
        }
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching webhook data:", error);
    res
      .status(500)
      .send({ message: "Error fetching webhook data", error: error });
  }
}
