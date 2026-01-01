// AI Golf Trip Assistant - OpenAI Integration
(function() {
    // Get API key from config
    const API_KEY = window.GOLFSLOT_CONFIG?.OPENAI_API_KEY || '';
    const API_URL = 'https://api.openai.com/v1/chat/completions';
    
    let chatHistory = [];
    let isOpen = false;
    
    // System prompt for the AI
    const SYSTEM_PROMPT = `You are a helpful golf trip planning assistant for GolfSlot. Your role is to help users plan golf trips.

When a user wants to add a new golf trip destination, gather the following information:
1. Destination/Location (city and state/country)
2. Best courses in the area (up to 4-5 courses with estimated prices)
3. Recommended accommodation options
4. Nearest airports and flight information from LAX and EWR
5. Best time of year to visit
6. Estimated total cost per person

Once you have enough information, format the trip details as JSON in this structure:
\`\`\`json
{
    "action": "add_destination",
    "destination": {
        "name": "City, State",
        "tagline": "Short description",
        "highlights": ["highlight1", "highlight2", "highlight3"],
        "weather": "70-80°F Average",
        "airport": "XXX",
        "courses": [
            {"name": "Course Name", "price": "$100-150pp", "description": "Brief description"}
        ],
        "accommodation": "Recommended hotel/resort",
        "flightFromLAX": {"time": "X hours", "price": "$XXX-XXX"},
        "flightFromEWR": {"time": "X hours", "price": "$XXX-XXX"},
        "totalEstimate": "$X,XXX - $X,XXX per person"
    }
}
\`\`\`

Be friendly, knowledgeable about golf destinations, and help users discover great golf trip options. If users ask about existing destinations (Scottsdale, St. George Utah, Dallas, Streamsong Florida), provide helpful tips and information.

Keep responses concise but informative. Use golf terminology appropriately.`;

    // Create chat UI
    function createChatUI() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'ai-chat-container';
        chatContainer.innerHTML = `
            <button id="ai-chat-toggle" title="Golf Trip AI Assistant">
                <i class="fas fa-robot"></i>
            </button>
            <div id="ai-chat-window">
                <div id="ai-chat-header">
                    <div class="ai-chat-title">
                        <i class="fas fa-robot"></i>
                        <span>Golf Trip AI Assistant</span>
                    </div>
                    <button id="ai-chat-close"><i class="fas fa-times"></i></button>
                </div>
                <div id="ai-chat-messages">
                    <div class="ai-message">
                        <div class="message-content">
                            👋 Hi! I'm your Golf Trip AI Assistant. I can help you:
                            <ul>
                                <li>Plan new golf trip destinations</li>
                                <li>Get course recommendations</li>
                                <li>Find flight and accommodation info</li>
                                <li>Add custom trips to GolfSlot</li>
                            </ul>
                            Where would you like to plan your next golf trip?
                        </div>
                    </div>
                </div>
                <div id="ai-chat-input-container">
                    <input type="text" id="ai-chat-input" placeholder="Ask about golf destinations...">
                    <button id="ai-chat-send"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        
        document.body.appendChild(chatContainer);
        addChatStyles();
        setupEventListeners();
    }
    
    function addChatStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            #ai-chat-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            #ai-chat-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(30, 58, 95, 0.4);
                transition: transform 0.3s, box-shadow 0.3s;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            #ai-chat-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(30, 58, 95, 0.5);
            }
            
            #ai-chat-toggle.hidden {
                display: none;
            }
            
            #ai-chat-window {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 380px;
                max-width: calc(100vw - 48px);
                height: 500px;
                max-height: calc(100vh - 120px);
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            
            #ai-chat-window.open {
                display: flex;
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            #ai-chat-header {
                background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .ai-chat-title {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
            }
            
            .ai-chat-title i {
                color: #e8b923;
            }
            
            #ai-chat-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.25rem;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            
            #ai-chat-close:hover {
                opacity: 1;
            }
            
            #ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .ai-message, .user-message {
                max-width: 85%;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                line-height: 1.5;
                font-size: 0.95rem;
            }
            
            .ai-message {
                background: #f3f4f6;
                color: #1f2937;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }
            
            .ai-message ul {
                margin: 0.5rem 0 0 1rem;
                padding: 0;
            }
            
            .ai-message li {
                margin: 0.25rem 0;
            }
            
            .user-message {
                background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }
            
            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 1rem;
                background: #f3f4f6;
                border-radius: 12px;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }
            
            .typing-indicator span {
                width: 8px;
                height: 8px;
                background: #9ca3af;
                border-radius: 50%;
                animation: bounce 1.4s infinite ease-in-out;
            }
            
            .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
            
            #ai-chat-input-container {
                padding: 1rem;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 0.5rem;
            }
            
            #ai-chat-input {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 24px;
                font-size: 0.95rem;
                outline: none;
                transition: border-color 0.2s;
            }
            
            #ai-chat-input:focus {
                border-color: #1e3a5f;
            }
            
            #ai-chat-send {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: linear-gradient(135deg, #e8b923 0%, #d4a84b 100%);
                border: none;
                color: #1e3a5f;
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: transform 0.2s;
            }
            
            #ai-chat-send:hover {
                transform: scale(1.1);
            }
            
            #ai-chat-send:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .destination-card {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 1px solid #86efac;
                border-radius: 8px;
                padding: 1rem;
                margin-top: 0.5rem;
            }
            
            .destination-card h4 {
                color: #166534;
                margin: 0 0 0.5rem 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .destination-card p {
                margin: 0.25rem 0;
                font-size: 0.9rem;
                color: #15803d;
            }
            
            .add-destination-btn {
                background: #16a34a;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 0.75rem;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .add-destination-btn:hover {
                background: #15803d;
            }
            
            @media (max-width: 480px) {
                #ai-chat-window {
                    width: calc(100vw - 24px);
                    right: -12px;
                    bottom: 70px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    function setupEventListeners() {
        const toggle = document.getElementById('ai-chat-toggle');
        const window = document.getElementById('ai-chat-window');
        const close = document.getElementById('ai-chat-close');
        const input = document.getElementById('ai-chat-input');
        const send = document.getElementById('ai-chat-send');
        
        toggle.addEventListener('click', () => {
            isOpen = true;
            window.classList.add('open');
            toggle.classList.add('hidden');
            input.focus();
        });
        
        close.addEventListener('click', () => {
            isOpen = false;
            window.classList.remove('open');
            toggle.classList.remove('hidden');
        });
        
        send.addEventListener('click', sendMessage);
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    async function sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const messages = document.getElementById('ai-chat-messages');
        const send = document.getElementById('ai-chat-send');
        
        const userMessage = input.value.trim();
        if (!userMessage) return;
        
        // Add user message
        const userDiv = document.createElement('div');
        userDiv.className = 'user-message';
        userDiv.textContent = userMessage;
        messages.appendChild(userDiv);
        
        input.value = '';
        send.disabled = true;
        
        // Add typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;
        
        // Add to chat history
        chatHistory.push({ role: 'user', content: userMessage });
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...chatHistory
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            typingDiv.remove();
            
            if (data.choices && data.choices[0]) {
                const aiResponse = data.choices[0].message.content;
                chatHistory.push({ role: 'assistant', content: aiResponse });
                
                // Check for destination JSON
                const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
                
                const aiDiv = document.createElement('div');
                aiDiv.className = 'ai-message';
                
                if (jsonMatch) {
                    try {
                        const destinationData = JSON.parse(jsonMatch[1]);
                        if (destinationData.action === 'add_destination') {
                            const dest = destinationData.destination;
                            aiDiv.innerHTML = `
                                <div class="message-content">
                                    I've created a trip profile for <strong>${dest.name}</strong>!
                                    <div class="destination-card">
                                        <h4><i class="fas fa-map-marker-alt"></i> ${dest.name}</h4>
                                        <p><strong>Weather:</strong> ${dest.weather}</p>
                                        <p><strong>Courses:</strong> ${dest.courses.map(c => c.name).join(', ')}</p>
                                        <p><strong>Est. Cost:</strong> ${dest.totalEstimate}</p>
                                        <button class="add-destination-btn" onclick="saveCustomDestination(${JSON.stringify(dest).replace(/"/g, '&quot;')})">
                                            <i class="fas fa-plus"></i> Save to My Trips
                                        </button>
                                    </div>
                                </div>
                            `;
                        }
                    } catch (e) {
                        aiDiv.innerHTML = `<div class="message-content">${formatMessage(aiResponse)}</div>`;
                    }
                } else {
                    aiDiv.innerHTML = `<div class="message-content">${formatMessage(aiResponse)}</div>`;
                }
                
                messages.appendChild(aiDiv);
            } else if (data.error) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'ai-message';
                errorDiv.innerHTML = `<div class="message-content">Sorry, I encountered an error: ${data.error.message}</div>`;
                messages.appendChild(errorDiv);
            }
        } catch (error) {
            typingDiv.remove();
            const errorDiv = document.createElement('div');
            errorDiv.className = 'ai-message';
            errorDiv.innerHTML = `<div class="message-content">Sorry, I couldn't connect to the AI service. Please try again.</div>`;
            messages.appendChild(errorDiv);
        }
        
        send.disabled = false;
        messages.scrollTop = messages.scrollHeight;
    }
    
    function formatMessage(text) {
        // Remove JSON blocks for display
        text = text.replace(/```json[\s\S]*?```/g, '');
        // Convert markdown-style formatting
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\n/g, '<br>');
        return text;
    }
    
    // Global function to save destinations
    window.saveCustomDestination = function(dest) {
        const customDests = JSON.parse(localStorage.getItem('golfslot_custom_destinations') || '[]');
        dest.id = Date.now();
        customDests.push(dest);
        localStorage.setItem('golfslot_custom_destinations', JSON.stringify(customDests));
        
        // Also add as a trip
        const trip = {
            id: Date.now(),
            name: `${dest.name} Golf Trip`,
            destination: dest.name,
            numPeople: 4,
            flights: {
                departure: 'LAX',
                arrival: dest.airport,
                pricePerPerson: parseInt(dest.flightFromLAX?.price?.match(/\d+/)?.[0]) || 0
            },
            accommodation: {
                name: dest.accommodation,
                price: 0
            },
            courses: dest.courses.map(c => ({
                name: c.name,
                price: parseInt(c.price?.match(/\d+/)?.[0]) || 0
            })),
            car: { price: 0 }
        };
        
        let trips = JSON.parse(localStorage.getItem('golfTrips') || '[]');
        trips.push(trip);
        localStorage.setItem('golfTrips', JSON.stringify(trips));
        
        alert(`${dest.name} has been saved to your trips! View it in "My Trips".`);
    };
    
    // Initialize chat when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatUI);
    } else {
        createChatUI();
    }
})();

