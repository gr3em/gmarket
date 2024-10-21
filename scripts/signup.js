document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                return user.updateProfile({
                    displayName: username
                });
            })
            .then(() => {
                console.log("User account created & signed in!");
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            })
            .catch((error) => {
                console.error("Error: ", error);
                alert(error.message);
            });
    });

    googleSignUpBtn.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                console.log("Google Sign-In Successful", result.user);
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            }).catch((error) => {
                console.error("Google Sign-In Error", error);
                alert(error.message);
            });
    });
});
