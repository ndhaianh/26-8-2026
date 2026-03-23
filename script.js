// ======================================================
// 12A3 - Thanh Niên Thời Đại Số | Main Script
// ======================================================

// ==================== PARTICLE CANVAS ====================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particlesArray = [];
let animationId;

function setCanvasSize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    const count = Math.min((canvas.width * canvas.height) / 15000, 120);
    for (let i = 0; i < count; i++) {
        particlesArray.push(new Particle());
    }
}

function connectParticles() {
    const maxDist = 12000;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const dist = dx * dx + dy * dy;
            if (dist < maxDist) {
                const opacity = 1 - dist / maxDist;
                ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.15})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    animationId = requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => { p.update(); p.draw(); });
    connectParticles();
}

if (canvas && ctx) {
    setCanvasSize();
    initParticles();
    animateParticles();
    window.addEventListener('resize', () => {
        setCanvasSize();
        initParticles();
    });
}

// ==================== MOBILE MENU ====================
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        menuToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuToggle.textContent = '☰';
        });
    });
}

// ==================== SCROLL ANIMATIONS ====================
const fadeElements = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

fadeElements.forEach(el => fadeObserver.observe(el));

// ==================== COUNT-UP ANIMATION ====================
const countElements = document.querySelectorAll('[data-count]');
const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = 'true';
            const target = parseInt(entry.target.dataset.count);
            let current = 0;
            const duration = 1500;
            const step = target / (duration / 16);
            const counter = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(counter);
                }
                entry.target.textContent = Math.floor(current);
            }, 16);
        }
    });
}, { threshold: 0.5 });

countElements.forEach(el => countObserver.observe(el));

// ==================== FIREBASE CONFIG ====================
// ⚠️ BẠN CẦN THAY THẾ CẤU HÌNH NÀY BẰNG CẤU HÌNH FIREBASE CỦA BẠN
// Để tạo Firebase project miễn phí:
// 1. Truy cập https://console.firebase.google.com
// 2. Tạo project mới → Chọn Realtime Database → Tạo database (Test mode)
// 3. Copy cấu hình vào đây
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "000000000000",
    appId: "YOUR_APP_ID"
};

let db = null;
let messagesRef = null;
let firebaseReady = false;

// Kiểm tra Firebase có sẵn không
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.log('Firebase SDK chưa được tải. Sử dụng LocalStorage.');
        updateStatus('offline', 'LocalStorage');
        return false;
    }

    // Kiểm tra config đã được cấu hình chưa
    if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
        console.log('Firebase chưa được cấu hình. Sử dụng LocalStorage fallback.');
        updateStatus('offline', 'LocalStorage (Chưa cấu hình Firebase)');
        return false;
    }

    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        messagesRef = db.ref('messages');
        firebaseReady = true;
        updateStatus('online', 'Cloud Real-time');
        return true;
    } catch (err) {
        console.error('Firebase init error:', err);
        updateStatus('offline', 'LocalStorage (Lỗi kết nối)');
        return false;
    }
}

function updateStatus(type, text) {
    const statusEl = document.getElementById('firebase-status');
    if (!statusEl) return;
    statusEl.className = `status-badge ${type}`;
    statusEl.innerHTML = `<span class="status-dot"></span> ${text}`;
}

// ==================== MESSAGE BOARD ====================
document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const senderInput = document.getElementById('sender-input');
    const messagesContainer = document.getElementById('messages-container');
    const sendBtn = document.getElementById('send-btn');

    if (!messageForm || !messagesContainer) return;

    const STORAGE_KEY = 'class12a3_messages';
    const MAX_MESSAGES = 200;

    const defaultMessages = [
        {
            sender: 'Hệ thống A3',
            text: 'Chào mừng đến Trạm Phát Tín Hiệu thời đại số của 12A3! 🚀 Để lại lời nhắn nhen.',
            time: new Date().toLocaleString('vi-VN')
        }
    ];

    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const createMessageElement = (sender, text, time) => {
        const div = document.createElement('div');
        div.className = 'message-card';
        div.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${escapeHTML(sender)}</span>
                <span class="message-time">${escapeHTML(time)}</span>
            </div>
            <div class="message-body">${escapeHTML(text).replace(/\n/g, '<br>')}</div>
        `;
        return div;
    };

    const renderMessages = (messages) => {
        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            messagesContainer.appendChild(
                createMessageElement(msg.sender || 'Ẩn danh', msg.text, msg.time)
            );
        });
    };

    // ---- FIREBASE MODE ----
    if (initFirebase() && firebaseReady) {
        // Listen for real-time messages
        messagesRef.orderByChild('timestamp').on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                renderMessages(defaultMessages);
                return;
            }
            const messages = Object.values(data).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            renderMessages(messages);
        });

        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = messageInput.value.trim();
            const sender = senderInput.value.trim() || 'Hacker Ẩn Danh';
            if (!text) return;

            sendBtn.disabled = true;
            sendBtn.textContent = 'ĐANG GỬI...';

            const newMsg = {
                sender,
                text,
                time: new Date().toLocaleString('vi-VN'),
                timestamp: Date.now()
            };

            messagesRef.push(newMsg)
                .then(() => {
                    messageInput.value = '';
                    senderInput.value = '';
                })
                .catch((err) => {
                    console.error('Send error:', err);
                    alert('Lỗi gửi tin nhắn. Thử lại sau!');
                })
                .finally(() => {
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'PHÁT TÍN HIỆU';
                });
        });

    } else {
        // ---- LOCALSTORAGE FALLBACK ----
        const loadMessages = () => {
            let messages = [];
            try {
                messages = JSON.parse(localStorage.getItem(STORAGE_KEY));
            } catch (e) { /* ignore */ }

            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                messages = defaultMessages;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            }
            renderMessages(messages);
        };

        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = messageInput.value.trim();
            const sender = senderInput.value.trim() || 'Hacker Ẩn Danh';
            if (!text) return;

            const newMsg = {
                sender,
                text,
                time: new Date().toLocaleString('vi-VN')
            };

            let messages = [];
            try {
                messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            } catch (e) { messages = []; }

            messages.unshift(newMsg);
            if (messages.length > MAX_MESSAGES) messages = messages.slice(0, MAX_MESSAGES);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));

            messagesContainer.prepend(createMessageElement(newMsg.sender, newMsg.text, newMsg.time));
            messageInput.value = '';
            senderInput.value = '';
        });

        loadMessages();
    }
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ==================== BACKGROUND MUSIC ====================
(function () {
    // 📌 HƯỚNG DẪN: Thay đường dẫn nhạc bên dưới bằng file MP3 của bạn.
    // Đặt file nhạc vào thư mục assets/ rồi sửa đường dẫn.
    const MUSIC_SRC = 'assets/background-music.mp3';

    // Tạo phần tử audio
    const bgMusic = document.createElement('audio');
    bgMusic.id = 'bg-music';
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    bgMusic.preload = 'auto';
    bgMusic.src = MUSIC_SRC;
    document.body.appendChild(bgMusic);

    // Tạo nút toggle nhạc
    const musicBtn = document.createElement('button');
    musicBtn.id = 'music-toggle';
    musicBtn.className = 'music-toggle';
    musicBtn.setAttribute('aria-label', 'Toggle nhạc nền');
    musicBtn.innerHTML = `
        <span class="music-icon music-on">🔊</span>
        <span class="music-icon music-off" style="display:none;">🔇</span>
        <span class="music-bars">
            <span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span>
        </span>
    `;
    document.body.appendChild(musicBtn);

    let isMusicPlaying = false;

    // Kiểm tra trạng thái lưu trước đó
    const savedState = localStorage.getItem('12a3-music-state');
    const shouldPlay = savedState !== 'off'; // Mặc định = bật

    function updateBtn() {
        const onIcon = musicBtn.querySelector('.music-on');
        const offIcon = musicBtn.querySelector('.music-off');
        if (isMusicPlaying) {
            onIcon.style.display = '';
            offIcon.style.display = 'none';
            musicBtn.classList.add('playing');
        } else {
            onIcon.style.display = 'none';
            offIcon.style.display = '';
            musicBtn.classList.remove('playing');
        }
    }

    function playMusic() {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            localStorage.setItem('12a3-music-state', 'on');
            updateBtn();
        }).catch(() => {
            // Autoplay bị chặn — chờ tương tác
        });
    }

    function pauseMusic() {
        bgMusic.pause();
        isMusicPlaying = false;
        localStorage.setItem('12a3-music-state', 'off');
        updateBtn();
    }

    function toggleMusic() {
        if (isMusicPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    }

    musicBtn.addEventListener('click', toggleMusic);

    // Tự động phát khi trang tải (nếu trạng thái = bật)
    if (shouldPlay) {
        playMusic();

        // Fallback: phát khi người dùng tương tác lần đầu
        const startOnInteraction = () => {
            if (!isMusicPlaying && shouldPlay) {
                playMusic();
            }
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('touchstart', startOnInteraction);
            document.removeEventListener('keydown', startOnInteraction);
        };
        document.addEventListener('click', startOnInteraction);
        document.addEventListener('touchstart', startOnInteraction);
        document.addEventListener('keydown', startOnInteraction);
    } else {
        updateBtn();
    }
})();
