// Password Protection for GolfSlot
(function() {
    // Get password from config
    const CORRECT_PASSWORD = window.GOLFSLOT_CONFIG?.SITE_PASSWORD || 'Mustang14';
    const AUTH_KEY = 'golfslot_authenticated';
    
    // Check if already authenticated
    function isAuthenticated() {
        return sessionStorage.getItem(AUTH_KEY) === 'true';
    }
    
    // Show password modal
    function showPasswordModal() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-modal">
                <div class="auth-logo">
                    <i class="fas fa-golf-ball"></i>
                </div>
                <h2>Welcome to GolfSlot</h2>
                <p>Please enter the password to continue</p>
                <form id="auth-form">
                    <input type="password" id="auth-password" placeholder="Enter password" autocomplete="off" autofocus>
                    <button type="submit">
                        <i class="fas fa-unlock"></i> Enter
                    </button>
                    <p id="auth-error" class="auth-error"></p>
                </form>
            </div>
        `;
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #auth-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
            }
            
            .auth-modal {
                background: white;
                padding: 3rem 2.5rem;
                border-radius: 16px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            
            .auth-logo {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #e8b923 0%, #d4a84b 100%);
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto 1.5rem;
            }
            
            .auth-logo i {
                font-size: 2.5rem;
                color: #1e3a5f;
            }
            
            .auth-modal h2 {
                color: #1e3a5f;
                margin-bottom: 0.5rem;
                font-size: 1.75rem;
            }
            
            .auth-modal > p {
                color: #6b7280;
                margin-bottom: 1.5rem;
            }
            
            #auth-form input {
                width: 100%;
                padding: 1rem;
                font-size: 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 1rem;
                box-sizing: border-box;
                transition: border-color 0.2s;
            }
            
            #auth-form input:focus {
                outline: none;
                border-color: #1e3a5f;
            }
            
            #auth-form button {
                width: 100%;
                padding: 1rem;
                font-size: 1rem;
                font-weight: 600;
                background: linear-gradient(135deg, #e8b923 0%, #d4a84b 100%);
                color: #1e3a5f;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 0.5rem;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            #auth-form button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(232, 185, 35, 0.4);
            }
            
            .auth-error {
                color: #dc2626;
                margin-top: 1rem;
                font-size: 0.9rem;
                min-height: 1.2em;
            }
            
            #auth-form input.shake {
                animation: shake 0.5s ease-in-out;
                border-color: #dc2626;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-10px); }
                40%, 80% { transform: translateX(10px); }
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(overlay);
        
        // Handle form submission
        document.getElementById('auth-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('auth-password');
            const error = document.getElementById('auth-error');
            
            if (input.value === CORRECT_PASSWORD) {
                sessionStorage.setItem(AUTH_KEY, 'true');
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.3s';
                setTimeout(() => overlay.remove(), 300);
            } else {
                error.textContent = 'Incorrect password. Please try again.';
                input.classList.add('shake');
                input.value = '';
                setTimeout(() => input.classList.remove('shake'), 500);
            }
        });
    }
    
    // Initialize
    if (!isAuthenticated()) {
        // Hide body content until authenticated
        document.documentElement.style.overflow = 'hidden';
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showPasswordModal);
        } else {
            showPasswordModal();
        }
    }
})();

