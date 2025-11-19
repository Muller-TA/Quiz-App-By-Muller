document.addEventListener("DOMContentLoaded", () => {

    /* ============================================================
       ===============  GLOBAL SELECTORS & VARIABLES  ===============
       ============================================================ */

    // Buttons
    const htmlQuiz = document.getElementById("html-btn");
    const cssQuiz = document.getElementById("css-btn");
    const jsQuiz = document.getElementById("js-btn");

    // UI Elements
    const submitButton = document.querySelector(".submit-button");
    const quizName = document.getElementById("quizName");
    const quizArea = document.getElementById("quiz-area");
    const answersArea = document.getElementById("answers-area");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const bulletsContainer = document.querySelector(".bullets");
    const questionsCountSpan = document.querySelector(".count span");
    const resultsContainer = document.querySelector(".results");
    const timerDisplay = document.getElementById("timer");

    // Data State
    let questionsObject = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];

    // Timer
    let quizTimer = null;
    const TOTAL_TIME = 300;

    /* ============================================================
       ==========================  CREATE  =========================
       ============================================================ */

    function startTimer() {
        clearInterval(quizTimer);
        let timeLeft = TOTAL_TIME;

        quizTimer = setInterval(() => {
            let m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
            let s = (timeLeft % 60).toString().padStart(2, "0");
            timerDisplay.textContent = `${m}:${s}`;

            if (timeLeft <= 0) {
                clearInterval(quizTimer);
                submitButton.click();
            }

            timeLeft--;
        }, 1000);
    }

    function resetUI(selectedBtn) {
        [htmlQuiz, cssQuiz, jsQuiz].forEach(btn => {
            btn.classList.toggle("bg-gray-600", btn === selectedBtn);
            if (btn !== selectedBtn) btn.remove();
        });

        quizArea.innerHTML = "";
        answersArea.innerHTML = "";
        bulletsContainer.innerHTML = "";
        resultsContainer.innerHTML = "";

        currentQuestionIndex = 0;
        userAnswers = [];

        clearInterval(quizTimer);
        timerDisplay.textContent = "05:00";
    }

    async function loadQuestions(file) {
        try {
            const response = await fetch(file);
            const data = await response.json();

            questionsObject = data;
            shuffleQuestions(questionsObject);

            questionsObject = questionsObject.slice(0, 10);

            questionsCountSpan.textContent = questionsObject.length;

            createBullets();
            renderQuestion(0);

        } catch (err) {
            console.error("Failed to load questions:", err);
        }
    }

    /* ============================================================
       ==========================  READ  =========================
       ============================================================ */

    function renderQuestion(index) {
        const q = questionsObject[index];
        if (!q) return;

        quizArea.innerHTML = `
            <h2 class="text-gray-800 font-semibold text-lg mb-4">
                ${q.title}
            </h2>`;

        answersArea.innerHTML = "";
        const answersWrapper = document.createElement("div");
        answersWrapper.className = "grid grid-cols-1 sm:grid-cols-2 gap-4";

        ["answer_1", "answer_2", "answer_3", "answer_4"].forEach(key => {
            const text = q[key];

            const wrapper = document.createElement("div");
            wrapper.className = "answer-option";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "answer";
            radio.value = text;
            radio.className = "hidden peer";

            if (userAnswers[index] === text) radio.checked = true;

            const box = document.createElement("div");
            box.className =
                "p-4 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer peer-checked:bg-gray-400 transition text-center";
            box.textContent = text;

            box.addEventListener("click", () => {
                radio.checked = true;
                userAnswers[index] = text;
            });

            wrapper.appendChild(radio);
            wrapper.appendChild(box);
            answersWrapper.appendChild(wrapper);
        });

        answersArea.appendChild(answersWrapper);
        updateBullets();
    }

    /* ============================================================
       ==========================  UPDATE  =========================
       ============================================================ */

    function shuffleQuestions(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    function createBullets() {
        bulletsContainer.innerHTML = "";
        questionsObject.forEach(() => {
            const dot = document.createElement("span");
            dot.className = "bullet w-3 h-3 rounded-full bg-gray-400";
            bulletsContainer.appendChild(dot);
        });
        updateBullets();
    }

    function updateBullets() {
        const bullets = document.querySelectorAll(".bullet");
        bullets.forEach((b, i) => {
            b.classList.toggle("bg-gray-600", i === currentQuestionIndex);
            b.classList.toggle("bg-gray-400", i !== currentQuestionIndex);
        });
    }

    prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion(currentQuestionIndex);
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questionsObject.length - 1) {
            currentQuestionIndex++;
            renderQuestion(currentQuestionIndex);
        }
    });

    /* ============================================================
       ==========================  DELETE  =========================
       ============================================================ */

    submitButton.addEventListener("click", () => {
        clearInterval(quizTimer);
        let score = 0;

        // Clear areas so we can display all questions at once
        quizArea.innerHTML = '';
        answersArea.innerHTML = '';

        questionsObject.forEach((q, index) => {
            const questionWrapper = document.createElement('div');
            questionWrapper.className = "mb-6";

            const qTitle = document.createElement('h2');
            qTitle.className = "text-gray-800 font-semibold text-lg mb-2";
            qTitle.textContent = `${index + 1}. ${q.title}`;
            questionWrapper.appendChild(qTitle);

            const answersWrapper = document.createElement("div");
            answersWrapper.className = "grid grid-cols-1 sm:grid-cols-2 gap-4";

            ['answer_1','answer_2','answer_3','answer_4'].forEach(key => {
                const ansText = q[key];

                const wrapper = document.createElement('div');
                wrapper.className = "answer-option";

                const radio = document.createElement('input');
                radio.type = "radio";
                radio.name = `answer_${index}`;
                radio.value = ansText;
                radio.disabled = true;
                radio.checked = userAnswers[index] === ansText;

                const box = document.createElement('div');
                box.className = "p-3 rounded-lg cursor-default text-center transition";
                box.textContent = ansText;

                if (ansText === q.right_answer) {
                    box.classList.add("bg-green-300","text-green-900","font-semibold");
                }
                if (userAnswers[index] === ansText && ansText !== q.right_answer) {
                    box.classList.add("bg-red-300","text-red-900","font-semibold");
                }

                wrapper.appendChild(radio);
                wrapper.appendChild(box);
                answersWrapper.appendChild(wrapper);
            });

            questionWrapper.appendChild(answersWrapper);
            quizArea.appendChild(questionWrapper);

            if (userAnswers[index] === q.right_answer) score++;
        });

        resultsContainer.innerHTML = `
            <h2 class="text-xl font-bold mb-4">Your Results:</h2>
            <p class="text-lg">You scored <span class="font-bold">${score}</span> /
            ${questionsObject.length} correct.</p>
        `;

        submitButton.style.display = "none";
    });

    /* ============================================================
       ==========================  EVENTS  =========================
       ============================================================ */

    htmlQuiz.onclick = () => {
        resetUI(htmlQuiz);
        loadQuestions("./HtmlQuestions.json");
        quizName.textContent = "HTML";
        startTimer();
        submitButton.style.display = "block";
    };

    cssQuiz.onclick = () => {
        resetUI(cssQuiz);
        loadQuestions("./CssQuestions.json");
        quizName.textContent = "CSS";
        startTimer();
        submitButton.style.display = "block";
    };

    jsQuiz.onclick = () => {
        resetUI(jsQuiz);
        loadQuestions("./JsQuestions.json");
        quizName.textContent = "JavaScript";
        startTimer();
        submitButton.style.display = "block";
    };

});
