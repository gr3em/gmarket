// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNrtV3TsMljkJHtst2aX87IeZOcQyNQ9A",
  authDomain: "stock-market-ce23e.firebaseapp.com",
  projectId: "stock-market-ce23e",
  storageBucket: "stock-market-ce23e.appspot.com",
  messagingSenderId: "996301529064",
  appId: "1:996301529064:web:e2409079602e8733714e5d",
  measurementId: "G-QMLTZ4S849"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize variables
const auth = firebase.auth();
const database = firebase.database();

// Set up our register function
function register() {
    // Get all our input fields
    email = document.getElementById('email').value
    password = document.getElementById('password').value
    full_name = document.getElementById('full_name').value
    favourite_song = document.getElementById('favourite_song').value
    milk_before_cereal = document.getElementById('milk_before_cereal').value

    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
        alert('Email or Password is Outta Line!!')
        return
        // Don't continue running the code
    }
    if (validate_field(full_name) == false || validate_field(favourite_song) == false || validate_field(milk_before_cereal) == false) {
        alert('One or More Extra Fields is Outta Line!!')
        return
    }

    // Move on with Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then(function () {
            // Declare user variable
            var user = auth.currentUser

            // Add this user to Firebase Database
            var database_ref = database.ref()

            // Create User data
            var user_data = {
                email: email,
                full_name: full_name,
                favourite_song: favourite_song,
                milk_before_cereal: milk_before_cereal,
                last_login: Date.now()
            }

            // Push to Firebase Database
            database_ref.child('users/' + user.uid).set(user_data)

            // DOne
            alert('User Created!!')
        })
        .catch(function (error) {
            // Firebase will use this to alert of its errors
            var error_code = error.code
            var error_message = error.message

            alert(error_message)
        })
}

// Set up our login function
function login() {
    // Get all our input fields
    email = document.getElementById('email').value
    password = document.getElementById('password').value

    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
        alert('Email or Password is Outta Line!!')
        return
        // Don't continue running the code
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(function () {
            // Declare user variable
            var user = auth.currentUser

            // Add this user to Firebase Database
            var database_ref = database.ref()

            // Create User data
            var user_data = {
                last_login: Date.now()
            }

            // Push to Firebase Database
            database_ref.child('users/' + user.uid).update(user_data)

            // DOne
            alert('User Logged In!!')

        })
        .catch(function (error) {
            // Firebase will use this to alert of its errors
            var error_code = error.code
            var error_message = error.message

            alert(error_message)
        })
}

// Validate Functions
function validate_email(email) {
    expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
        // Email is good
        return true
    } else {
        // Email is not good
        return false
    }
}

function validate_password(password) {
    // Firebase only accepts lengths greater than 6
    if (password < 6) {
        return false
    } else {
        return true
    }
}

function validate_field(field) {
    if (field == null) {
        return false
    }

    if (field.length <= 0) {
        return false
    } else {
        return true
    }
}

// New authentication state listener
auth.onAuthStateChanged(function(user) {
    const authRequired = document.querySelectorAll('.auth-required');
    const authNotRequired = document.querySelectorAll('.auth-not-required');
    
    if (user) {
        console.log('User is signed in');
        authRequired.forEach(el => el.style.display = 'inline-block');
        authNotRequired.forEach(el => el.style.display = 'none');
        
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
            window.location.href = '/pages/home.html';
        }
    } else {
        console.log('No user is signed in');
        authRequired.forEach(el => el.style.display = 'none');
        authNotRequired.forEach(el => el.style.display = 'inline-block');
        
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = '/index.html';
        }
    }
});

// Google Sign-In
const googleSignInBtn = document.querySelector('.oauth-btn[data-provider="gmail"]');
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Google Sign-In button clicked');
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                console.log('Google Sign-In Successful', result.user);
                window.location.href = '/pages/home.html';
            }).catch((error) => {
                console.error('Google Sign-In Error', error.code, error.message);
                alert('Failed to sign in with Google. Error: ' + error.message);
            });
    });
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        auth.signOut().then(() => {
            console.log('User signed out');
            window.location.href = '/index.html';
        }).catch((error) => {
            console.error('Sign out error', error);
        });
    });
}

// Handle navigation clicks
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const isAuthRequired = this.closest('.auth-required');
        
        if (isAuthRequired && !auth.currentUser) {
            console.log('Auth required, user not logged in. Redirecting to sign in page.');
            window.location.href = '/index.html';
            return;
        }
        
        window.location.href = href;
    });
});

// Handle sign up link click
const signupLink = document.getElementById('signupLink');
if (signupLink) {
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Hide login form
        document.querySelector('.login-form').style.display = 'none';
        // Show signup form
        document.querySelector('.signup-form').style.display = 'block';
    });
}

// Handle "Already have an account? Sign in" link click
const signinLink = document.getElementById('signinLink');
if (signinLink) {
    signinLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Hide signup form
        document.querySelector('.signup-form').style.display = 'none';
        // Show login form
        document.querySelector('.login-form').style.display = 'block';
    });
}
