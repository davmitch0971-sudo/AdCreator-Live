const express = require('express');
const app = express();
const path = require('path');

// Serve static files (CSS, JS) from the current directory (root)
app.use(express.static(__dirname));

// Route the root URL to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`AdCreator-AI backend running and listening on port ${PORT}`);
});
