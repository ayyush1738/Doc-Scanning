const app = require("./app.js");
const { PORT } = require("./src/config/config.js");

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
