const express = require('express');
const cors = require('cors'); // Import cors
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors()); // Allow all domains (in your case, localhost:5173)

// POST route to run the Python script
app.post('/run-python-script', (req, res) => {
    // Extract the question from the request body
    const { question } = req.body;

    if (!question) {
        return res.status(400).send('Question is required');
    }

    // Command to activate the virtual environment and run the script with the user-provided question
    const command = `source pdf_extractor_env/bin/activate && python3 mistral.py constitution.pdf "${question}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send(`Stderr: ${stderr}`);
        }
        res.send({ output: stdout });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
