const express = require("express");

const app = express();

app.get("/", (_req, res) => {
  res.send("ok");
});

// Hardcoded port — platforms that inject PORT will mis-route health checks.
app.listen(3000, () => {
  console.log("listening on 3000");
});
