export default async function handler(req, res) {
  console.log(req.query);
  try {
    const arrayToTree = (urls) => {
      const map = {};
      const root = { name: "urls", children: [] };

      urls.forEach((url) => {
        const parts = url.split("/").filter(Boolean); // Filter out empty strings
        let current = root; // Start with the root node 'urls'

        parts.forEach((part, index) => {
          const key = parts.slice(0, index + 1).join("/");

          if (!map[key]) {
            map[key] = { name: part, children: [] };
            current.children.push(map[key]);
          }

          current = map[key];
        });
      });

      return root; // Return the single object with the root node
    };

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

    // SQL query to get the latest entry for each uid
    const query = `
        SELECT DISTINCT ON (data->'data'->'entry'->>'uid') data->'data'->'entry' AS entry
        FROM webhook_data
        ORDER BY data->'data'->'entry'->>'uid', timestamp DESC;
      `;

    const result = await sql.unsafe(query);

    const allEntries = result.map((row) => row.entry);
    const filteredEntries = allEntries.filter((entry) => entry.url);
    const urls = filteredEntries.map((entry) => entry.url);

    const treeData = arrayToTree(urls);
console.log(urls)
    res.status(200).json(treeData);
  } catch (error) {
    console.error("Error fetching webhook data:", error);
    res.status(500).send({ message: "Error fetching webhook data", error });
  }
}
