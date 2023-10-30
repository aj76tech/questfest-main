document.addEventListener('DOMContentLoaded', function() {
    const startQuizButton = document.querySelector('#startQuizButton');
    const phoneInput = document.getElementById("phoneInput");
    const editButton = document.getElementById("edit");
    const confirmationPopup = document.getElementById("confirmationPopup");
    const confirmStart = document.getElementById("confirmStart");
    hideConfirmationPopup();

    if (startQuizButton) {
        startQuizButton.addEventListener('click', async function(e) {
            e.preventDefault();

            let phoneNumber = phoneInput.value.trim();
            if (!phoneNumber) {
                alert("Please enter a valid phone number.");
                return;
            }

            // Check if phone number already played
            let checkResponse = await fetch(`https://www.soulocal.in/checkPhoneNumber/${phoneNumber}`);
            let checkData = await checkResponse.json();
            
            if (checkData.played) {
                alert("You have already played the quiz!");
                return;
            }

            // If not played, store the phone number in the database
            let storeResponse = await fetch('https://www.soulocal.in/storePhoneNumber', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ number: phoneNumber })
            });

            let storeData = await storeResponse.json();
            if (storeResponse.status !== 201) {
                alert(storeData.message);
                return;
            }

            // Store the phone number in localStorage and proceed to the quiz
            localStorage.setItem('phoneNumber', phoneNumber);
            startQuizButton.style.opacity = '0.5';

            // Show the confirmation popup to the user
            showConfirmationPopup();
        });
    }

    if (editButton) {
        editButton.addEventListener('click', function() {
            // Reset phone input
            phoneInput.value = '';

            // Reset the button opacity
            startQuizButton.style.opacity = '1';

            // Hide the confirmation popup
            hideConfirmationPopup();
        });
    }

    if (confirmStart) {
        confirmStart.addEventListener('click', function(e) {
            e.preventDefault();
            setTimeout(() => {
                window.location.href = "../quiz.html";
            }, 300);
        });
    }
});

function showConfirmationPopup() {
    confirmationPopup.style.display = 'block';
}

function hideConfirmationPopup() {
    confirmationPopup.style.display = 'none';
}
