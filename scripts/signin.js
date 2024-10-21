document.addEventListener('DOMContentLoaded', function() {
    const signInForm = document.getElementById('signin-form');
    const googleSignInButton = document.getElementById('googleSignIn');

    signInForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                window.location.href = '/pages/home.html';
            })
            .catch((error) => {
                console.error("Sign-In Error", error);
                alert(error.message);
            });
    });

    googleSignInButton.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                // Google sign-in successful, redirect to dashboard or home page
                window.location.href = '/pages/home.html';
            }).catch((error) => {
                console.error("Google Sign-In Error", error);
                alert(error.message);
            });
    });
});

