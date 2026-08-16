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
        answer : 2
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

const questionEL = document.getElementById("question")

function startQuiz() {
    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
}

function loadQuestion(){
    const q = questions[currentIndex]
}