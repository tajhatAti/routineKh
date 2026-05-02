const weeklyRoutine = {
    "Sunday": [
        { time: "10:15", subject: "জীব বিজ্ঞান-২", room: "২০১", end: "11:00" },
        { time: "11:00", subject: "রসায়ন-২", room: "২০৪", end: "11:45" },
        { time: "12:00", subject: "ভূমি আর্দ্রতা সংরক্ষণে উৎপাদন প্রযুক্তি-২", room: "৩০১", end: "12:45" }
    ],
    "Monday": [
        { time: "10:15", subject: "পদার্থ বিজ্ঞান-২", room: "২০২", end: "11:00" },
        { time: "11:00", subject: "বাংলা-২", room: "১০৫", end: "11:45" },
        { time: "12:00", subject: "রসায়ন-২", room: "২০৪", end: "12:45" }
    ],
    "Tuesday": [
        { time: "11:00", subject: "কম্পিউটার অ্যাপ্লিকেশন", room: "Lab 1", end: "11:45" },
        { time: "11:45", subject: "ভূমি আর্দ্রতা প্রযুক্তি (ব্যব)", room: "Field", end: "12:30" },
        { time: "12:30", subject: "জীব বিজ্ঞান-২ (ব্যব)", room: "Lab 2", end: "13:15" },
        { time: "13:15", subject: "রসায়ন (ব্যব)", room: "Lab 3", end: "14:00" }
    ],
    "Wednesday": [
        { time: "10:15", subject: "পদার্থ বিজ্ঞান-২ (ব্যব)", room: "Lab 1", end: "11:00" },
        { time: "11:00", subject: "ইংরেজি", room: "১০২", end: "11:45" },
        { time: "11:45", subject: "বাংলা-২ (বাকি অংশ/আলোচনা)", room: "১০৫", end: "12:30" }
    ]
};

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function updateSmartSystem() {
    const now = new Date();
    const dayName = days[now.getDay()];
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTimeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    document.getElementById('live-time').innerText = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('live-date').innerText = now.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' });

    let currentDayRoutine = weeklyRoutine[dayName] || [];
    let displayDay = dayName;
    let isNextDay = false;

    if (currentDayRoutine.length > 0) {
        const lastClass = currentDayRoutine[currentDayRoutine.length - 1];
        if (currentTimeStr >= lastClass.end) {
            isNextDay = true;
        }
    } else {
        isNextDay = true;
    }

    if (isNextDay) {
        let nextDayIndex = (now.getDay() + 1) % 7;
        if (days[nextDayIndex] === "Friday") nextDayIndex = (nextDayIndex + 1) % 7;
        displayDay = days[nextDayIndex];
    }

    const title = document.getElementById('view-title');
    const container = document.getElementById('routine-display');
    
    title.innerText = isNextDay ? "আগামীকালের রুটিন" : "আজকের রুটিন";
    
    let routineHTML = "";
    const displayData = weeklyRoutine[displayDay] || [];

    if (displayData.length === 0) {
        routineHTML = `<div class="glass p-10 text-center text-gray-500 italic">আগামীকাল কোনো ক্লাস নেই, আরাম করুন!</div>`;
    } else {
        displayData.forEach(item => {
            const isLive = !isNextDay && (currentTimeStr >= item.time && currentTimeStr < item.end);
            
            routineHTML += `
                <div class="glass p-5 flex justify-between items-center transition-all duration-500 ${isLive ? 'highlight-card' : ''}">
                    <div>
                        <h3 class="text-lg font-bold ${isLive ? 'text-cyan-300' : 'text-gray-100'}">${item.subject}</h3>
                        <p class="text-xs text-gray-400">রুম: ${item.room}</p>
                    </div>
                    <div class="text-right">
                        <span class="block font-mono ${isLive ? 'text-cyan-400 font-bold' : 'text-gray-400'}">${item.time} - ${item.end}</span>
                        ${isLive ? '<span class="text-[10px] font-bold text-cyan-300 uppercase tracking-widest"><span class="status-dot animate-ping mr-2"></span>চলমান</span>' : ''}
                    </div>
                </div>
            `;
        });
    }
    container.innerHTML = routineHTML;
}

setInterval(updateSmartSystem, 1000);
updateSmartSystem();
