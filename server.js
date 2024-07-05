const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3000;

// Replace 'your_actual_api_key_here' with your actual OpenAI API key
const OPENAI_API_KEY = 'dummy';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Set up session management
app.use(session({
    secret: 'your_secret_key_here', // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true in production with HTTPS
}));

app.post('/analyze', async (req, res) => {
    const inputText = req.body.inputText;
    if (!inputText) {
        return res.status(400).json({ error: 'Input text is required' });
    }
    console.log('Received input text:', inputText);

    try {
        console.log('Sending request to OpenAI API...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: inputText }
                ],
                max_tokens: 150
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (!data.choices || data.choices.length === 0) {
            throw new Error('No choices in response');
        }

        res.json({ response: data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/quiz', async (req, res) => {
    if (!req.session.previousQuestions) {
        req.session.previousQuestions = [];
    }
    const previousQuestions = req.session.previousQuestions;
    const inputText = req.body.inputText;

    try {
        let uniqueQuestionFound = false;
        let quizData = null;

        while (!uniqueQuestionFound) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: inputText }
                    ],
                    max_tokens: 150
                })
            });

            const data = await response.json();
            if (!data.choices || data.choices.length === 0) {
                throw new Error('No choices in response');
            }

            quizData = data.choices[0].message.content.trim();
            const quizJson = JSON.parse(quizData);

            if (!previousQuestions.includes(quizJson.question)) {
                uniqueQuestionFound = true;
                previousQuestions.push(quizJson.question);
                req.session.previousQuestions = previousQuestions;
            }
        }

        res.json({ quiz: JSON.parse(quizData) });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
