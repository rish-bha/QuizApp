let currentQuestion = null;
let currentOptions = [];
let correctAnswerIndex = null;
let currentDifficulty = 'medium'; // Default difficulty
let quizLength = 5; // Default quiz length
let questionsAsked = 0;
let correctAnswers = 0;

document.getElementById('easyButton').addEventListener('click', () => setDifficulty('easy'));
document.getElementById('mediumButton').addEventListener('click', () => setDifficulty('medium'));
document.getElementById('hardButton').addEventListener('click', () => setDifficulty('hard'));

document.getElementById('shortQuizButton').addEventListener('click', () => setQuizLength(5));
document.getElementById('normalQuizButton').addEventListener('click', () => setQuizLength(10));
document.getElementById('longQuizButton').addEventListener('click', () => setQuizLength(25));

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    document.getElementById('quiz-length-buttons').style.display = 'block';
}

function setQuizLength(length) {
    quizLength = length;
    document.getElementById('quiz-setup').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    fetchQuestion();
}

async function fetchQuestion() {
    const inputText = `Generate a ${currentDifficulty} unique multiple-choice question with four options. Do not repeat questions. Format it as JSON only with "question", "options", and "answer_index" keys. Do not format it as markdown.`;
    
    try {
        const response = await fetch('/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputText })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        const quizData = data.quiz;
        currentQuestion = quizData.question;
        currentOptions = quizData.options;
        correctAnswerIndex = quizData.answer_index;

        displayQuestion();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('quiz-result').textContent = 'Error: ' + error.message;
    }
}

function displayQuestion() {
    document.getElementById('question').textContent = currentQuestion;
    const optionButtons = document.querySelectorAll('.option');
    optionButtons.forEach((button, index) => {
        button.textContent = currentOptions[index];
        button.disabled = false;
    });
    document.getElementById('quiz-result').textContent = '';
}

document.getElementById('nextQuestionButton').addEventListener('click', fetchQuestion);

document.querySelectorAll('.option').forEach(button => {
    button.addEventListener('click', () => {
        const selectedIndex = parseInt(button.getAttribute('data-index'));
        if (selectedIndex === correctAnswerIndex) {
            document.getElementById('quiz-result').textContent = 'Correct!';
            correctAnswers++;
        } else {
            document.getElementById('quiz-result').textContent = 'Wrong! The correct answer was: ' + currentOptions[correctAnswerIndex];
        }
        questionsAsked++;
        document.querySelectorAll('.option').forEach(b => b.disabled = true);
        
        if (questionsAsked >= quizLength) {
            displayFinalScore();
        } else {
            setTimeout(fetchQuestion, 2000); // Wait 2 seconds before fetching the next question
        }
    });
});

function displayFinalScore() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-setup').style.display = 'block';
    document.getElementById('quiz-setup').innerHTML = `<h2>Final Score</h2><p>You got ${correctAnswers} out of ${quizLength} questions correct.</p><button onclick="resetQuiz()">Start New Quiz</button>`;
}

function resetQuiz() {
    questionsAsked = 0;
    correctAnswers = 0;
    document.getElementById('quiz-setup').innerHTML = `
        <h2>AI Quiz Setup</h2>
        <div id="difficulty-buttons">
            <button id="easyButton" data-difficulty="easy">Easy</button>
            <button id="mediumButton" data-difficulty="medium">Medium</button>
            <button id="hardButton" data-difficulty="hard">Hard</button>
        </div>
        <div id="quiz-length-buttons" style="display: none;">
            <button id="shortQuizButton" data-length="5">Short (5 Questions)</button>
            <button id="normalQuizButton" data-length="10">Normal (10 Questions)</button>
            <button id="longQuizButton" data-length="25">Long (25 Questions)</button>
        </div>
    `;
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-setup').style.display = 'block';

    document.getElementById('easyButton').addEventListener('click', () => setDifficulty('easy'));
    document.getElementById('mediumButton').addEventListener('click', () => setDifficulty('medium'));
    document.getElementById('hardButton').addEventListener('click', () => setDifficulty('hard'));

    document.getElementById('shortQuizButton').addEventListener('click', () => setQuizLength(5));
    document.getElementById('normalQuizButton').addEventListener('click', () => setQuizLength(10));
    document.getElementById('longQuizButton').addEventListener('click', () => setQuizLength(25));
}
