// Initialize Firebase (make sure this is at the top of your file)
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullName').value;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                return user.updateProfile({
                    displayName: fullName
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

    googleSignUpBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                console.log("Google Sign-In Successful", result.user);
                // Redirect to dashboard or home page after successful sign-in
                window.location.href = 'dashboard.html';
            }).catch((error) => {
                console.error("Google Sign-In Error", error);
                alert(error.message);
            });
    });
});
