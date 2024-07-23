export default async function handler(req, res) {
  if (req.method == "POST") {
    try {
      const data = req.body;
      console.log(data);
    } catch (error) {
      res.status(400).json({ error: "Invalid JSON in request body" });
    }
  }
}
