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
const auth = firebase.auth();
const db = firebase.firestore();

// Alpha Vantage API key
const ALPHA_VANTAGE_API_KEY = 'KJLA4R0M7HP4KERR';

document.addEventListener('DOMContentLoaded', () => {
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = contactForm.name.value;
            const email = contactForm.email.value;
            const message = contactForm.message.value;

            try {
                await db.collection('messages').add({
                    name: name,
                    email: email,
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                successMessage.style.display = 'block';
                contactForm.reset();
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Error sending message. Please try again.');
            }
        });
    }

    // Toggle between sign-in and sign-up forms
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const toggleSignup = document.getElementById('toggle-signup');

    if (toggleSignup) {
        toggleSignup.addEventListener('click', (e) => {
            e.preventDefault();
            signinForm.style.display = signinForm.style.display === 'none' ? 'block' : 'none';
            signupForm.style.display = signupForm.style.display === 'none' ? 'block' : 'none';
            toggleSignup.textContent = toggleSignup.textContent === 'Sign up' ? 'Sign in' : 'Sign up';
        });
    }

    // Sign-in functionality
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("User signed in:", userCredential.user);
                    window.location.href = '/stock-market-website/pages/home.html';
                })
                .catch((error) => {
                    console.error("Error signing in:", error);
                    alert("Error signing in: " + error.message);
                });
        });
    }

    // Sign-up functionality
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            const confirmPassword = e.target['confirm-password'].value;

            if (password !== confirmPassword) {
                alert("Passwords don't match");
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("User signed up:", userCredential.user);
                    window.location.href = '/stock-market-website/pages/home.html';
                })
                .catch((error) => {
                    console.error("Error signing up:", error);
                    alert("Error signing up: " + error.message);
                });
        });
    }

    // OAuth functionality
    const oauthButtons = document.querySelectorAll('.oauth-btn');
    oauthButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const provider = e.target.dataset.provider;
            let authProvider;
            switch(provider) {
                case 'gmail':
                    authProvider = new firebase.auth.GoogleAuthProvider();
                    break;
                case 'yahoo':
                    authProvider = new firebase.auth.OAuthProvider('yahoo.com');
                    break;
                case 'microsoft':
                    authProvider = new firebase.auth.OAuthProvider('microsoft.com');
                    break;
                default:
                    console.error('Unknown provider:', provider);
                    return;
            }
            auth.signInWithPopup(authProvider)
                .then((result) => {
                    console.log(`${provider} sign in successful:`, result.user);
                    window.location.href = '/stock-market-website/pages/home.html';
                })
                .catch((error) => {
                    console.error(`${provider} sign in error:`, error);
                    alert(`Error signing in with ${provider}: ${error.message}`);
                });
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Stock data fetching
    async function fetchStockData(symbol) {
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data['Error Message']) {
                throw new Error(data['Error Message']);
            }
            return data['Time Series (Daily)'];
        } catch (error) {
            console.error("Error fetching stock data:", error);
            throw error;
        }
    }

    // Chart updating
    const chart = document.getElementById('chart');
    const loading = document.getElementById('loading');
    if (chart) {
        const candleSeries = LightweightCharts.createChart(chart, {
            width: chart.clientWidth,
            height: chart.clientHeight
        }).addCandlestickSeries();

        async function updateChart(symbol) {
            try {
                loading.style.display = 'block';
                const data = await fetchStockData(symbol);
                const formattedData = Object.entries(data).map(([date, values]) => ({
                    time: date,
                    open: parseFloat(values['1. open']),
                    high: parseFloat(values['2. high']),
                    low: parseFloat(values['3. low']),
                    close: parseFloat(values['4. close'])
                })).reverse();
                candleSeries.setData(formattedData);
                updateStockInfo(symbol, formattedData[formattedData.length - 1]);
            } catch (error) {
                console.error("Error updating chart:", error);
                alert("Error fetching stock data. Please try again.");
            } finally {
                loading.style.display = 'none';
            }
        }

        function updateStockInfo(symbol, latestData) {
            document.getElementById('stockSymbol').textContent = symbol;
            document.getElementById('currentPrice').textContent = latestData.close;
            document.getElementById('openPrice').textContent = latestData.open;
            document.getElementById('highPrice').textContent = latestData.high;
            document.getElementById('lowPrice').textContent = latestData.low;
        }

        // Initial chart load
        updateChart('AAPL');

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const symbolInput = document.getElementById('symbolInput');
        if (searchBtn && symbolInput) {
            searchBtn.addEventListener('click', () => {
                const symbol = symbolInput.value.toUpperCase();
                updateChart(symbol);
            });
        }
    }

    // Responsive chart resizing
    window.addEventListener('resize', () => {
        if (chart) {
            chart.applyOptions({ width: chart.clientWidth, height: chart.clientHeight });
        }
    });

    // Auth state change handler
    auth.onAuthStateChanged((user) => {
        console.log('Auth state changed. User:', user ? 'Logged in' : 'Not logged in');
        console.log('Current path:', window.location.pathname);

        const authRequired = document.querySelectorAll('.auth-required');
        const authNotRequired = document.querySelectorAll('.auth-not-required');
        const currentPath = window.location.pathname;

        // Function to check if the current path is an authenticated page
        const isAuthenticatedPage = (path) => {
            const authenticatedPages = ['/pages/home.html', '/pages/market.html', '/pages/contact.html'];
            return authenticatedPages.some(page => path.endsWith(page));
        };

        // Function to check if the current path is the index page
        const isIndexPage = (path) => {
            return path === '/' || path.endsWith('/index.html');
        };

        if (user) {
            console.log('User is signed in. Showing auth-required elements.');
            authRequired.forEach(el => el.style.display = 'inline-block');
            authNotRequired.forEach(el => el.style.display = 'none');
            
            if (isIndexPage(currentPath)) {
                console.log('On index page while logged in. Redirecting to home.');
                window.location.href = '/pages/home.html';
            } else {
                console.log('On authenticated page while logged in. No redirection needed.');
            }
        } else {
            console.log('No user is signed in. Showing auth-not-required elements.');
            authRequired.forEach(el => el.style.display = 'none');
            authNotRequired.forEach(el => el.style.display = 'inline-block');
            
            if (isAuthenticatedPage(currentPath)) {
                console.log('On authenticated page while not logged in. Redirecting to index.');
                window.location.href = '/index.html';
            } else {
                console.log('On index page while not logged in. No redirection needed.');
            }
        }
    });
});

function logout() {
    auth.signOut().then(() => {
        console.log('User signed out');
        window.location.href = '/index.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// Add this event listener after your DOM content is loaded
document.getElementById('logoutBtn').addEventListener('click', logout);
