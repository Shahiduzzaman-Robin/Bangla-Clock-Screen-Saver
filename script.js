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
        const h24 = now.getHours();
        if (h24 >= 0 && h24 < 4) ampm = 'রাত';
        else if (h24 >= 4 && h24 < 6) ampm = 'ভোর';
        else if (h24 >= 6 && h24 < 12) ampm = 'সকাল';
        else if (h24 >= 12 && h24 < 15) ampm = 'দুপুর';
        else if (h24 >= 15 && h24 < 18) ampm = 'বিকেল';
        else if (h24 >= 18 && h24 < 20) ampm = 'সন্ধ্যা';
        else ampm = 'রাত';
        
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
    const combinedString = `${dateString} <span style="opacity:0.4; margin:0 12px; font-size: 0.9em;">•</span> ${banglaDateString}`;
    
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
    clockHeader.style.opacity = '1';
    clockHeader.style.pointerEvents = 'auto';

    inactivityTimer = setTimeout(() => {
        document.body.classList.add('no-cursor');
        clockHeader.style.opacity = '0';
        clockHeader.style.pointerEvents = 'none';
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

// Fetch Location Data (Localized)
async function updateLocation() {
    try {
        const response = await fetch('http://ip-api.com/json/');
        const data = await response.json();
        const locationEl = document.getElementById('location');

        if (data.status === 'success') {
            const translatedCity = (locationTranslations[data.city] || data.city).trim();
            const translatedCountry = (locationTranslations[data.country] || data.country).trim();
            locationEl.textContent = `${translatedCity}, ${translatedCountry}`;
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
