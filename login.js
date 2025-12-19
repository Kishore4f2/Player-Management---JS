document.addEventListener('DOMContentLoaded', () => {
    const showSigninBtn = document.getElementById('show-signin');
    const showSignupBtn = document.getElementById('show-signup');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    // Toggle to Sign Up
    showSignupBtn.addEventListener('click', () => {
        showSigninBtn.classList.remove('active');
        showSignupBtn.classList.add('active');
        signinForm.style.display = 'none';
        signupForm.style.display = 'flex'; // Restore flex because .form-group needs it? No, form itself usually block or flex
        // Actually, in style.css .form-container uses flex, but the forms themselves are children.
        // Let's check style.css again. .form-container has display: flex; flex-wrap: wrap;
        // In login.html, I putforms INSIDE .form-container.
        // So the forms should probably NOT be flex containers themselves unless I styled them so.
        // In my HTML: <form ... class="auth-form">
        // I will add .auth-form styles in CSS to ensure they behave right.

        // Simple animation/transition could be added here if I was fancy, 
        // but for now just switching display.
    });

    // Toggle to Sign In
    showSigninBtn.addEventListener('click', () => {
        showSignupBtn.classList.remove('active');
        showSigninBtn.classList.add('active');
        signupForm.style.display = 'none';
        signinForm.style.display = 'flex';
    });

    // Handle Sign In Submit
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Welcome back, ${data.user.name}!`);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Is the backend server running?');
        }
    });

    // Handle Sign Up Submit
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (password !== confirm) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Account created successfully! Please Log In.');
                // Switch to login form
                document.getElementById('show-signin').click();
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Is the backend server running?');
        }
    });
});
