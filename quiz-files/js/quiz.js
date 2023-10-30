let questions = [];
let typingIntervalId;
let currentQuestion = 0;
let failedAttempts = 0;
let points = 0;
let answeredQuestions;

window.onload = async function() {
    // Fetch questions from the JSON file
    try {
        let response = await fetch('https://www.soulocal.in/a/quiz-files/js/questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        
        for (let category in data) {
            let questionArray = data[category];
            let randomQuestion = questionArray[Math.floor(Math.random() * questionArray.length)];
            questions.push(randomQuestion);
        }
        
        answeredQuestions = Array(questions.length).fill(false);

    } catch (error) {
        console.error("Error loading questions:", error);
        return;
    }

    loadQuestion(currentQuestion);
    updateCouponCounter();
}

async function submitPhoneNumberAndCoupons(phone, coupons) {
    console.log("Sending phone:", phone, "with coupons:", coupons);

    try {
        let response = await fetch(`https://www.soulocal.in/a/updateCoupons/${phone}/${coupons}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to submit data.');
        }
    } catch (error) {
        console.error(error);
    }
}

function resetButtonStyles() {
    const optionButtons = document.querySelectorAll(".optionBtn");
    optionButtons.forEach(button => {
        button.removeAttribute("style");
        button.disabled = false;  
        button.onclick = null;
    });
    document.querySelector('.hint-content').style.display = 'none';
    document.querySelector('.hint-button').style.display = 'block';
}

function loadQuestion(index) {
    resetButtonStyles();

    // Reset hint button
    document.querySelector('.hint-button').style.opacity = "1";
    document.querySelector('.hint-button').style.display = "block";
    
    const progress = ((index + 1) / questions.length) * 100;
    document.querySelector(".progress-bar").style.width = progress + "%";

    const question = questions[index];
    const questionElement = document.getElementById("questionText");
    
    // If it's an image question (pictionary) and the first question
    if (index == 0 && question.isImageQuestion) {
        questionElement.innerHTML = `
            <div class="pictionary-container">
                <span class="question-number">Q${index + 1}: Guess the name of the place</span>
                <img src="${question.image}" alt="Question Image" class="question-image">
            </div>
        `;
    } else {
        questionElement.textContent = `Q${index + 1}. ${question.text}`;
    }
    
    const optionButtons = document.querySelectorAll(".optionBtn");
    optionButtons.forEach((button, idx) => {
        button.textContent = questions[index].options[idx];
        button.onclick = () => checkAnswer(idx, questions[index].correct);
        resetAnimation(button, "fadeInDown 0.8s ease forwards"); 
    });

    const hintElement = document.querySelector(".hint-content");
    hintElement.textContent = questions[index].hint;
}



function checkAnswer(chosenIdx, correctIdx) {
    const optionButtons = document.querySelectorAll(".optionBtn");
    if (answeredQuestions[currentQuestion]) {
        return;
    }

    if (chosenIdx !== correctIdx) {
        optionButtons[chosenIdx].style.backgroundColor = "#FF3030";
        optionButtons[chosenIdx].onclick = null;
        failedAttempts++;
        if (failedAttempts >= 2) {
            answeredQuestions[currentQuestion] = true;
            failedAttempts = 0;
            showPopup("sorryPopup", questions[currentQuestion].options[correctIdx]);
        } else {
            document.querySelector('.hint-content').style.display = 'block';
            document.querySelector('.hint-button').style.display = 'none';
        }
    } else {
        points += 2;
        answeredQuestions[currentQuestion] = true;
        updateCouponCounter();
        showPopup("hurrayPopup", questions[currentQuestion].options[correctIdx]);
    }
}

document.querySelector(".hint-button").addEventListener("click", function() {
    const hintContent = document.querySelector(".hint-content");
    const hintButton = document.querySelector(".hint-button");
    hintButton.style.transition = "opacity 0.3s";
    hintButton.style.opacity = "0";
    setTimeout(() => {
        hintButton.style.display = "none";
        hintContent.style.display = "block";
        hintContent.style.opacity = "0";
        hintContent.style.transition = "opacity 0.3s";
        setTimeout(() => {
            hintContent.style.opacity = "1";
        }, 50);
    }, 300);

    if (!answeredQuestions[currentQuestion]) {
        points -= 1;
        updateCouponCounter();
    }
});

function updateCouponCounter() {
    let coupons = Math.floor(points / 2);
    document.getElementById("couponCounter").innerText = `Coupons Earned: ${coupons}`;
}

function showPopup(popupId, correctAnswer = "") {
    if (correctAnswer) {
        let correctAnswerElem;
        if (popupId === "hurrayPopup") {
            correctAnswerElem = document.getElementById("hurrayCorrectAnswer");
        } else if (popupId === "sorryPopup") {
            correctAnswerElem = document.getElementById("sorryCorrectAnswer");
        }
        if (correctAnswerElem) {
            correctAnswerElem.textContent = "Correct answer: " + correctAnswer;
        }
    }
    document.getElementById(popupId).style.display = "block";
    document.body.classList.add("popup-active");
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
    document.body.classList.remove("popup-active");
    if (popupId === "hurrayPopup" || popupId === "sorryPopup") {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion(currentQuestion);
        } else {
            completionPageAction();
        }
    }
}


document.getElementById("quitClaimButton").addEventListener("click", function() {
    showPopup("areYouSurePopup");
});

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("hurrayContinue").addEventListener("click", function() {
        closePopup("hurrayPopup");
    });
    document.getElementById("sorryContinue").addEventListener("click", function() {
        closePopup("sorryPopup");
    });
    document.getElementById("noQuitButton").addEventListener("click", function() {
        closePopup("areYouSurePopup");
    });
    document.getElementById("yesQuitButton").addEventListener("click", function() {
        completionPageAction();
    });
});

async function completionPageAction() {
    const earnedCoupons = Math.floor(points / 2);
    const phoneNumber = localStorage.getItem('phoneNumber');
    if (phoneNumber) {
        await submitPhoneNumberAndCoupons(phoneNumber, earnedCoupons);
    }
    window.location.href = 'completion_page.html?coupons=' + earnedCoupons;
}
function resetAnimation(element, animationName) {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger a reflow. This line is essential for the animation to restart
    element.style.animation = animationName;
}

