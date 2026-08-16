const questions = [
    {
        question : "Which Language is used for Web development?",
        options : ["Python","HTML","Java","C++"],
        answer: 1
    },
    {
        question : "Which framework is used with python?",
        options : ["React","Angular","Django","Vue"] ,
        answer: 2 ,
    },
    {
        question : "What does CSS stand for?",
        options: [
            "Creative Style System",
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Colorful Style Sheets"
        ],
        answer : 1
    },
    {
        question : "Which symbol is used for ID in CSS?",
        options :[".","#","*","&"],
        answer : 1
    },
    {
        question : "JavaScript is ____ language?",
        options : ["Compiled","Markup","Scripting","Assembly"],
        answer : 2
    }
]
let currentIndex = 0;
let score = 0;


const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const optionsEL = document.getElementById("options");
const questionEL = document.getElementById("question");
const finalScoreEL = document.getElementById("finaleScore")
const scoreCountEL = document.getElementById("scoreCount");
const questionCountEL = document.getElementById("questionCount")
function startQuiz() {
    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    loadQuestion()
}

function loadQuestion(){
    questionCountEL.textContent = ` Question ${currentIndex+1} / ${questions.length}`
    const q = questions[currentIndex]
    questionEL.textContent = q.question;
    optionsEL.innerHTML = "";

    q.options.forEach((opt,index) => {
        const div = document.createElement("div")
        div.className = "option";
        div.textContent = opt;
        div.onclick = () => selectAnswer(div,index);
        optionsEL.appendChild(div)
    })
}

function selectAnswer(selected, index){
    const correctIndex = questions[currentIndex].answer;
    const options = document.querySelectorAll(".option");

    options.forEach(o => o.style.pointerEvents = "none")

    if (index === correctIndex) {
        selected.classList.add("correct");
            score++;
            scoreCountEL.textContent = ` Score : ${score}`
    } else {
        selected.classList.add("wrong");
        options[correctIndex].classList.add("correct");
        scoreCountEL.textContent = ` Score : ${score}`
    }
}

function nextQuestion() {
    currentIndex ++;
    if (currentIndex < questions.length){
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    quizScreen.classList.add("hidden")
    resultScreen.classList.remove("hidden")
    finalScoreEL.textContent = `${score} / ${questions.length}`;
}

function restartQuiz(){
    currentIndex = 0;
    score = 0;
    resultScreen.classList.add("hidden")
    startScreen.classList.remove("hidden")
}