/**
 * Bangla Digital Clock Logic
 */

const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const ampmEl = document.getElementById('ampm');
const dateEl = document.getElementById('full-date');
const ampmContainer = document.getElementById('ampm-container');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const clockContainer = document.querySelector('.clock-container');
const clockHeader = document.querySelector('.clock-header');

let inactivityTimer;
let forcedTheme = null;
const INACTIVITY_TIME = 5000; // 5 seconds

// Mapping digits from English to Bengali
const banglaDigits = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

const banglaDays = [
    'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

const banglaMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Helper: Convert English number to Bengali string
function toBangla(number) {
    let str = number.toString();
    if (str.length === 1) str = '0' + str;
    return str.split('').map(digit => banglaDigits[digit] || digit).join('');
}

// Global variables for keeping track of last units (to avoid flickering)
let lastH = '', lastM = '', lastS = '';

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let is24Hour = false;
    let ampm = '';

    if (!is24Hour) {
        if (typeof forcedTheme !== 'undefined' && forcedTheme) {
             const labels = { 
                night: 'রাত', morning: 'ভোর', afternoon: 'দুপুর', 
                lateAfternoon: 'বিকেল', evening: 'সন্ধ্যা' 
             };
             ampm = labels[forcedTheme] || '';
        } else {
            const h24 = now.getHours();
            if (h24 >= 0 && h24 < 4) ampm = 'রাত';
            else if (h24 >= 4 && h24 < 6) ampm = 'ভোর';
            else if (h24 >= 6 && h24 < 12) ampm = 'সকাল';
            else if (h24 >= 12 && h24 < 15) ampm = 'দুপুর';
            else if (h24 >= 15 && h24 < 18) ampm = 'বিকেল';
            else if (h24 >= 18 && h24 < 20) ampm = 'সন্ধ্যা';
            else ampm = 'রাত';
        }
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle 0 -> 12
        ampmContainer.style.display = 'block';
    } else {
        ampmContainer.style.display = 'none';
    }

    const hStr = toBangla(hours);
    const mStr = toBangla(minutes);
    const sStr = toBangla(seconds);

    // Update with animation if the value changed
    if (hStr !== lastH) {
        updateElement(hoursEl, hStr);
        lastH = hStr;
    }
    if (mStr !== lastM) {
        updateElement(minutesEl, mStr);
        lastM = mStr;
    }
    if (sStr !== lastS) {
        updateElement(secondsEl, sStr);
        lastS = sStr;
    }

    if (!is24Hour && ampmEl.textContent !== ampm) {
        ampmEl.textContent = ampm;
        const dummy = document.getElementById('ampm-dummy');
        if (dummy) dummy.textContent = ampm;
    }

    // Bangla Date Calculation
    function getBanglaDate(dateObj) {
        const bMonths = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
        const gY = dateObj.getFullYear();
        const gM = dateObj.getMonth();
        const gD = dateObj.getDate();

        // Pohela Boishakh (April 14) determines the Bengali year boundaries
        const isAfterBoishakh = (gM > 3) || (gM === 3 && gD >= 14);
        const startYear = isAfterBoishakh ? gY : gY - 1;
        const bYear = startYear - 593;

        // Falgun leap year check relies on the Gregorian year that contains Falgun (Feb/Mar of startYear + 1)
        const yearOfFalgun = startYear + 1;
        const isLeapYear = (yearOfFalgun % 4 === 0 && yearOfFalgun % 100 !== 0) || (yearOfFalgun % 400 === 0);
        
        const bDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeapYear ? 30 : 29, 30];

        const startDate = new Date(startYear, 3, 14); // April 14
        const targetDate = new Date(gY, gM, gD); // normalized exactly to 00:00:00 to avoid DST shifting issues
        
        const diff = targetDate - startDate;
        let daysPassed = Math.round(diff / 86400000); // 86400000 ms per day

        let bMonthIndex = 0;
        while (daysPassed >= bDays[bMonthIndex]) {
            daysPassed -= bDays[bMonthIndex];
            bMonthIndex++;
        }

        const bDay = daysPassed + 1;
        return `${toBangla(bDay)} ${bMonths[bMonthIndex]} ${toBangla(bYear)}`;
    }

    // Update Dates
    const dayName = banglaDays[now.getDay()];
    const dayDate = toBangla(now.getDate());
    const monthName = banglaMonths[now.getMonth()];
    const year = toBangla(now.getFullYear());
    
    // Combine Gregorian and Bangla Dates into a single line
    const dateString = `${dayName}, ${dayDate} ${monthName} ${year}`;
    const banglaDateString = getBanglaDate(now);
    
    // Use a clean bullet point (•) as a sophisticated visual separator
    const combinedString = `${dateString} <span style="opacity:0.4; margin:0 15px; font-size: 1.1em; display: inline-block; transform: translateY(2px);">•</span> ${banglaDateString}`;
    
    if (dateEl.innerHTML !== combinedString) {
        dateEl.innerHTML = combinedString;
    }
}

// Update the element text with a smooth vertical slide animation
function updateElement(el, newValue) {
    const inner = el.querySelector('.digit-inner');
    const currentSpan = inner.querySelector('span');
    const oldValue = currentSpan.textContent;

    if (newValue === oldValue) return;

    // Clear any previous interrupted animations
    const existingSpans = inner.querySelectorAll('span');
    if (existingSpans.length > 1) {
        existingSpans.forEach((s, idx) => { if (idx > 0) s.remove(); });
    }

    // 1. Add the new value slot below the current one
    const nextSpan = document.createElement('span');
    nextSpan.textContent = newValue;
    inner.appendChild(nextSpan);

    // 2. Animate the 'inner' container up
    inner.classList.add('sliding');
    inner.style.transform = 'translateY(-100%)';
    currentSpan.style.opacity = '0.3'; // Fade only the OLD number
    nextSpan.style.opacity = '1';      // Ensure the NEW number is fully white

    // 3. Finalize: Switch the main text and reset the container position
    setTimeout(() => {
        inner.classList.remove('sliding');
        
        // Remove the transition temporarily to prevent the 'fade-up' blink
        currentSpan.style.transition = 'none';
        currentSpan.textContent = newValue;
        currentSpan.style.opacity = '1';
        inner.style.transform = 'translateY(0)';
        
        // Use a tiny delay or trigger reflow to re-enable transition for the next cycle
        void currentSpan.offsetWidth;
        currentSpan.style.transition = '';
        
        nextSpan.remove();
    }, 850); // Matches the 0.85s transition in CSS
}

// Global variables for keeping track of last units are defined above on line 41

// Initial Call
setInterval(updateClock, 1000);
updateClock();

// Fullscreen Toggle
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Update UI when fullscreen changes
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';
    } else {
        fullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
    }
});

// Auto-hide UI & Cursor for Screensaver effect
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    document.body.classList.remove('no-cursor');
    
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.style.opacity = '1';
        fullscreenBtn.style.pointerEvents = 'auto';
    }
    
    inactivityTimer = setTimeout(() => {
        document.body.classList.add('no-cursor');
        if (fullscreenBtn) {
            fullscreenBtn.style.opacity = '0';
            fullscreenBtn.style.pointerEvents = 'none';
        }
    }, INACTIVITY_TIME);
}

// Listen for mouse movement or interaction
window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('mousedown', resetInactivityTimer);
window.addEventListener('touchstart', resetInactivityTimer);
window.addEventListener('keydown', resetInactivityTimer);

// Initial Timer start
resetInactivityTimer();


// Comprehensive Translation Mapping for Bangladesh Locations
const locationTranslations = {
    // Country
    'Bangladesh': 'বাংলাদেশ',
    
    // Major Cities & Districts (including variations)
    'Dhaka': 'ঢাকা',
    'Chattogram': 'চট্টগ্রাম',
    'Chittagong': 'চট্টগ্রাম',
    'Khulna': 'খুলনা',
    'Sylhet': 'সিলেট',
    'Rajshahi': 'রাজশাহী',
    'Barisal': 'বরিশাল',
    'Barishal': 'বরিশাল',
    'Rangpur': 'রংপুর',
    'Mymensingh': 'ময়মনসিংহ',
    'Cox\'s Bazar': 'কক্সবাজার',
    'Coxs Bazar': 'কক্সবাজার',
    'Cumilla': 'কুমিল্লা',
    'Comilla': 'কুমিল্লা',
    'Gazipur': 'গাজীপুর',
    'Narayanganj': 'নারায়ণগঞ্জ',
    'Narsingdi': 'নরসিংদী',
    'Bagerhat': 'বাগেরহাট',
    'Bandarban': 'বান্দরবান',
    'Barguna': 'বরগুনা',
    'Bhola': 'ভোলা',
    'Bogura': 'বগুড়া',
    'Bogra': 'বগুড়া',
    'Brahmanbaria': 'ব্রাহ্মণবাড়িয়া',
    'Chandpur': 'চাঁদপুর',
    'Chuadanga': 'চুয়াডাঙ্গা',
    'Dinajpur': 'দিনাজপুর',
    'Faridpur': 'ফরিদপুর',
    'Feni': 'ফেনী',
    'Gaibandha': 'গাইবান্ধা',
    'Gopalganj': 'গোপালগঞ্জ',
    'Habiganj': 'হবিগঞ্জ',
    'Jamalpur': 'জামালপুর',
    'Jashore': 'যশোর',
    'Jessore': 'যশোর',
    'Jhalokati': 'ঝালকাঠি',
    'Jhenaidah': 'ঝিনাইদহ',
    'Joypurhat': 'জয়পুরহাট',
    'Khagrachhari': 'খাগড়াছড়ি',
    'Kishoreganj': 'কিশোরগঞ্জ',
    'Kurigram': 'কুড়িগ্রাম',
    'Kushtia': 'কুষ্টিয়া',
    'Lakshmipur': 'লক্ষ্মীপুর',
    'Lalmonirhat': 'লালমনিরহাট',
    'Madaripur': 'মাদারীপুর',
    'Magura': 'মাগুরা',
    'Manikganj': 'মানিকগঞ্জ',
    'Meherpur': 'মেহেরপুর',
    'Moulvibazar': 'মৌলভীবাজার',
    'Munshiganj': 'মুন্সীগঞ্জ',
    'Naogaon': 'নওগাঁ',
    'Narail': 'নড়াইল',
    'Natore': 'নাটোর',
    'Netrokona': 'নেত্রকোণা',
    'Nilphamari': 'নীলফামারী',
    'Noakhali': 'নোয়াখালী',
    'Pabna': 'পাবনা',
    'Panchagarh': 'পঞ্চগড়',
    'Patuakhali': 'পটুয়াখালী',
    'Pirojpur': 'পিরোজপুর',
    'Rajbari': 'রাজবাড়ী',
    'Rangamati': 'রাঙ্গামাটি',
    'Satkhira': 'সাতক্ষীরা',
    'Shariatpur': 'শরীয়তপুর',
    'Sherpur': 'শেরপুর',
    'Sirajganj': 'সিরাজগঞ্জ',
    'Sunamganj': 'সুনামগঞ্জ',
    'Tangail': 'টাঙ্গাইল',
    'Thakurgaon': 'ঠাকুরগাঁও'
};

// Fetch Location & Weather Data (Localized)
async function updateLocation() {
    const locationEl = document.getElementById('location');
    const tempEl = document.getElementById('temp');

    try {
        // 1. Get Location
        const ipResponse = await fetch('http://ip-api.com/json/');
        const ipData = await ipResponse.json();

        if (ipData.status === 'success') {
            const translatedCity = (locationTranslations[ipData.city] || ipData.city).trim();
            const translatedCountry = (locationTranslations[ipData.country] || ipData.country).trim();
            locationEl.textContent = `${translatedCity}, ${translatedCountry}`;

            // 2. Get Weather for this location
            try {
                const weatherResponse = await fetch(`https://wttr.in/${ipData.city}?format=j1`);
                const weatherData = await weatherResponse.json();
                const currentCondition = weatherData.current_condition[0];
                const currentTemp = currentCondition.feelsLikeC || currentCondition.temp_C; // Use feelsLike if preferred or just temp
                tempEl.textContent = `${toBangla(currentCondition.temp_C)}°সে.`;
                document.getElementById('weather-dot').style.opacity = '0.4';
            } catch (weatherErr) {
                console.error("Weather error:", weatherErr);
                // Fallback attempt without specific city
                const fallbackRes = await fetch('https://wttr.in/?format=%t');
                const fallbackTemp = await fallbackRes.text();
                if (fallbackTemp && !fallbackTemp.includes("Unknown")) {
                     const num = fallbackTemp.replace(/[^0-9-]/g, '');
                     tempEl.textContent = `${toBangla(num)}°সে.`;
                     document.getElementById('weather-dot').style.opacity = '0.4';
                }
            }
        } else {
            locationEl.textContent = "অবস্থান লোড করা সম্ভব হয়নি";
        }
    } catch (error) {
        console.error("Error fetching location:", error);
        locationEl.textContent = "ইন্টারনেট সংযোগ যাচাই করুন";
    }
}

// Initial Location Fetch
updateLocation();
// Update location every hour
setInterval(updateLocation, 3600000);

// =============================================
// ✨ STARRY BACKGROUND + 🌅 TIME-BASED THEMES
// =============================================

let starsCanvas, ctx;
let stars = [];
let shootingStars = [];
let clouds = [];
let rain = [];

const themes = {
    night: { 
        bg: '#04060f', accent: '#9CD5FF', circle2: '#1a0a3a', 
        starVisible: true, cloudVisible: false, rainVisible: false,
        horizon: 'rgba(15, 25, 60, 0.3)', labelColor: 'rgba(255, 255, 255, 0.6)'
    },
    morning: { 
        bg: '#060a0f', accent: '#FFD580', circle2: '#0a1a3a', 
        starVisible: true, cloudVisible: true, rainVisible: false,
        horizon: 'rgba(30, 45, 90, 0.2)', labelColor: 'rgba(255, 255, 255, 0.6)'
    },
    afternoon: { 
        bg: '#1b65c4', accent: '#ffffff', circle2: '#ffffff', 
        starVisible: false, cloudVisible: true, rainVisible: false,
        horizon: 'rgba(2, 43, 101, 0.4)', // Deep navy horizon for atmospheric depth
        labelColor: 'rgba(255, 255, 255, 0.8)'
    },
    lateAfternoon: { 
        bg: '#0a1a2a', accent: '#FFCC80', circle2: '#1a2a4a', 
        starVisible: false, cloudVisible: true, rainVisible: true,
        horizon: 'rgba(255, 100, 50, 0.2)', labelColor: 'rgba(255, 255, 255, 0.6)'
    },
    evening: { 
        bg: '#0a0505', accent: '#FFB6A3', circle2: '#1a0a0a', 
        starVisible: true, cloudVisible: true, rainVisible: true,
        horizon: 'rgba(60, 20, 30, 0.4)', labelColor: 'rgba(255, 255, 255, 0.6)'
    },
};



function getTheme(hour) {
    if (hour >= 20 || hour < 4)  return themes.night;
    if (hour >= 4  && hour < 6)  return themes.morning;
    if (hour >= 6  && hour < 12) return themes.morning; // Treat morning/early morning together for visual simplicity
    if (hour >= 12 && hour < 15) return themes.afternoon;
    if (hour >= 15 && hour < 18) return themes.lateAfternoon; // বিকেল
    return themes.evening;
}

function applyTheme() {
    const hour = new Date().getHours();
    const theme = forcedTheme ? themes[forcedTheme] : getTheme(hour);
    
    // Detailed logs for debugging
    console.log("Applying theme:", forcedTheme || 'auto', theme.bg);

    document.documentElement.style.backgroundColor = theme.bg;
    document.body.style.backgroundColor = theme.bg;
    document.body.style.setProperty('--bg-color', theme.bg);
    document.body.style.setProperty('--accent-color', theme.accent);
    document.body.style.setProperty('--dynamic-label', theme.labelColor);

    
    const ampmText = document.getElementById('ampm');
    if (ampmText) {
        ampmText.style.color = theme.accent;
        // Don't update textContent here, let updateClock do it based on forcedTheme
    }
    
    const locText = document.querySelector('.location-text');
    if (locText) locText.style.color = theme.accent;
    
    const c2 = document.querySelector('.circle-2');
    if (c2) c2.style.background = `radial-gradient(circle, ${theme.circle2}, transparent)`;
}

function setManualTheme(themeKey) {
    console.log("Setting theme to:", themeKey);
    if (themeKey === 'auto') {
        forcedTheme = null;
        updateClock(); // Reset ampm text to real time
    } else {
        forcedTheme = themeKey;
    }
    applyTheme();
}

function resizeCanvas() {
    if (!starsCanvas) return;
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    createStars();
    createClouds();
}

function createStars() {
    stars = [];
    const count = Math.floor((starsCanvas.width * starsCanvas.height) / 3000); // More stars
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            radius: Math.random() * 1.5 + 0.5, // Slightly larger
            opacity: Math.random() * 0.7 + 0.3, // Brighter
            speed: Math.random() * 0.01 + 0.003,
            phase: Math.random() * Math.PI * 2,
        });
    }
}

function drawMoon() {
    if (!ctx) return;
    const mx = starsCanvas.width - 150;
    const my = 120;
    const r = 45; // Larger moon
    const size = Math.ceil(r * 6);

    const off = document.createElement('canvas');
    off.width = size; off.height = size;
    const oc = off.getContext('2d');
    const cx = size / 2; const cy = size / 2;

    oc.beginPath();
    oc.arc(cx, cy, r, 0, Math.PI * 2);
    oc.fillStyle = '#FFF5C0';
    oc.fill();

    oc.globalCompositeOperation = 'destination-out';
    oc.beginPath();
    oc.arc(cx + r * 0.5, cy - r * 0.1, r * 0.9, 0, Math.PI * 2);
    oc.fillStyle = 'rgba(0,0,0,1)';
    oc.fill();

    const glow = ctx.createRadialGradient(mx, my, r * 0.3, mx, my, r * 3);
    glow.addColorStop(0, 'rgba(255, 240, 160, 0.3)');
    glow.addColorStop(1, 'rgba(255, 240, 160, 0)');
    ctx.beginPath();
    ctx.arc(mx, my, r * 3, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.drawImage(off, mx - cx, my - cy);
}


function createClouds() {
    clouds = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
        clouds.push({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * (starsCanvas.height * 0.5),
            width: Math.random() * 180 + 120,
            height: Math.random() * 50 + 30,
            speed: Math.random() * 0.2 + 0.1,
            opacity: Math.random() * 0.15 + 0.15 // Slightly more visible
        });
    }
}

function createRainDrop() {
    rain.push({
        x: Math.random() * starsCanvas.width,
        y: -10,
        len: Math.random() * 20 + 10,
        speed: Math.random() * 12 + 10,
        opacity: Math.random() * 0.3 + 0.1
    });
}

function drawHorizon(theme) {
    if (!theme.horizon || !ctx) return;
    const gradient = ctx.createLinearGradient(0, starsCanvas.height, 0, starsCanvas.height * 0.5);
    gradient.addColorStop(0, theme.horizon);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, starsCanvas.height * 0.5, starsCanvas.width, starsCanvas.height * 0.5);
}

function createShootingStar() {
    shootingStars.push({
        x: Math.random() * starsCanvas.width,
        y: Math.random() * (starsCanvas.height / 2),
        len: Math.random() * 80 + 50,
        speed: Math.random() * 12 + 8,
        opacity: 1,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1)
    });
}

function drawAtmosphere() {
    if (!ctx) return;
    const hour = new Date().getHours();
    const theme = forcedTheme ? themes[forcedTheme] : getTheme(hour);
    
    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    const t = Date.now() / 1000;
    
    drawHorizon(theme);

    if (theme.starVisible) {
        stars.forEach(star => {
            const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * star.speed * 10 + star.phase));
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * star.opacity})`;
            ctx.fill();
        });

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            let s = shootingStars[i];
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.opacity -= 0.015;
            if (s.opacity <= 0) { shootingStars.splice(i, 1); continue; }
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
            ctx.stroke();
            ctx.restore();
        }
        if (Math.random() < 0.005) createShootingStar();
        drawMoon();
    }


    if (theme.cloudVisible) {
        clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > starsCanvas.width) cloud.x = -cloud.width;
            ctx.save();
            // The "Phantom Shadow" trick: Draw the shape far away and cast only the shadow back
            const shadowOffset = 5000; // Draw shapes 5000px off-screen
            ctx.shadowBlur = 45;       // High blur for maximum puffiness
            ctx.shadowColor = `rgba(255, 255, 255, ${cloud.opacity})`;
            ctx.shadowOffsetX = shadowOffset;
            ctx.shadowOffsetY = 0;
            
            // Render the solid "puffs" far to the left, so only their shadows are visible on-screen
            ctx.beginPath();
            ctx.ellipse(cloud.x - shadowOffset, cloud.y, cloud.width, cloud.height, 0, 0, Math.PI * 2);
            ctx.ellipse(cloud.x - shadowOffset - cloud.width * 0.3, cloud.y + 10, cloud.width * 0.7, cloud.height * 0.8, 0, 0, Math.PI * 2);
            ctx.ellipse(cloud.x - shadowOffset + cloud.width * 0.4, cloud.y + 5, cloud.width * 0.6, cloud.height * 0.7, 0, 0, Math.PI * 2);
            
            ctx.fillStyle = 'black'; // The color of the phantom shape doesn't matter, only the shadow does
            ctx.fill();
            ctx.restore();
        });
    }

    if (theme.rainVisible) {
        if (Math.random() < 0.4) createRainDrop();
        for (let i = rain.length - 1; i >= 0; i--) {
            let r = rain[i];
            r.y += r.speed;
            r.x += 1;
            if (r.y > starsCanvas.height) { rain.splice(i, 1); continue; }
            ctx.strokeStyle = `rgba(200, 220, 255, ${r.opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x + 2, r.y + r.len);
            ctx.stroke();
        }
    }

    requestAnimationFrame(drawAtmosphere);
}

// Inactivity handler is defined at the top

// Initialize everything (DOM is ready since script is at the bottom)
starsCanvas = document.getElementById('stars-canvas');
if (starsCanvas) {
    ctx = starsCanvas.getContext('2d');
    console.log("Canvas context initialized");
    resizeCanvas();
    drawAtmosphere();
} else {
    console.error("Stars canvas not found!");
}


applyTheme();
setInterval(() => { if (!forcedTheme) applyTheme(); }, 60000);
window.addEventListener('resize', resizeCanvas);
