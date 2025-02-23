console.log('Script loaded!');
// Rest of your scripts.js code
// 
let currentDayIndex = 0;
let journeyDays = [];

// Fetch and load journey data
async function loadJourneyData() {
    try {
        const response = await fetch('notes.json');
        const data = await response.json();
        return data.journey.days;
    } catch (error) {
        console.error('Error loading journey data:', error);
        return [];
    }
}

// Calculate position along path
function getPointAlongPath(progress) {
    const path = document.getElementById('flightPath');
    const svgPoint = path.getPointAtLength(path.getTotalLength() * progress);
    
    // Get SVG and container dimensions
    const svg = document.querySelector('.flight-path-svg');
    const svgRect = svg.getBoundingClientRect();
    
    // Convert SVG coordinates to screen coordinates
    const x = (svgPoint.x / 2000) * svgRect.width;
    const y = (svgPoint.y / 1080) * svgRect.height;
    
    return { x, y };
}

// Update the plane position function to use screen coordinates
function updatePosition(progress) {
    const point = getPointAlongPathScreen(progress);
    const plane = document.querySelector('.plane');
    plane.style.left = `${point.x}px`;
    plane.style.top = `${point.y}px`;

    const completedPath = document.getElementById('completedPath');
    const length = completedPath.getTotalLength();
    completedPath.style.strokeDasharray = `${length * progress} ${length}`;
}

// Display memory card
function displayMemory(day) {
    const card = document.querySelector('.memory-card');
    
    // Format the date properly
    const date = new Date(day.date);
    // Add 1 to month since getMonth() returns 0-11
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate() + 1).padStart(2, '0')}`;
    card.querySelector('.date').textContent = formattedDate;
    if (day.image) {
        card.querySelector('img').src = day.image;
        card.querySelector('img').style.display = 'block';
    } else {
        card.querySelector('img').style.display = 'none';
    }
    card.querySelector('.content').textContent = day.content;
}

// Calculate current progress
function calculateDateProgress(date) {
    const startDate = new Date('2025-01-02');
    const endDate = new Date('2025-06-01');
    const currentDate = new Date(date);
    
    return (currentDate - startDate) / (endDate - startDate);
}

function initializeToCurrentDate() {
    const currentDate = new Date('2025-02-23');
    // Find the last non-empty entry on or before the current date
    for (let i = journeyDays.length - 1; i >= 0; i--) {
        const entryDate = new Date(journeyDays[i].date);
        if (entryDate <= currentDate && (journeyDays[i].content || journeyDays[i].image)) {
            currentDayIndex = i;
            break;
        }
    }
    if (currentDayIndex < 0) currentDayIndex = 0;
    updateDisplay();
}

function updateDisplay() {
    const day = journeyDays[currentDayIndex];
    const progress = calculateDateProgress(day.date);
    updatePosition(progress);
    displayMemory(day);
}

function getPointAlongPathScreen(progress) {
    const path = document.getElementById('flightPath');
    const svgPoint = path.getPointAtLength(path.getTotalLength() * progress);
    
    // Get SVG and container dimensions
    const svg = document.querySelector('.flight-path-svg');
    const svgRect = svg.getBoundingClientRect();
    
    // Convert SVG coordinates to screen coordinates
    const x = (svgPoint.x / 2000) * svgRect.width;
    const y = (svgPoint.y / 1080) * svgRect.height;
    
    return { x, y };
}
function showPreviousDayDots() {
    journeyDays.forEach((day, index) => {
        if (new Date(day.date) <= new Date('2025-02-22')) {
            const progress = calculateDateProgress(day.date);
            const point = getPointAlongPathSVG(progress);
            
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", point.x);
            dot.setAttribute("cy", point.y);
            dot.setAttribute("r", "4");
            dot.classList.add("day-dot");
            
            document.querySelector('.flight-path-svg').appendChild(dot);
            
            setTimeout(() => {
                dot.style.opacity = '1';
            }, index * 100);
        }
    });
}

function getPointAlongPathSVG(progress) {
    const path = document.getElementById('flightPath');
    const point = path.getPointAtLength(path.getTotalLength() * progress);
    return { x: point.x, y: point.y };
}

function startTutorial() {
    // Show rewind button
    const rewindBtn = document.querySelector('.controls .rewind');
    rewindBtn.style.opacity = '1';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    tooltip.textContent = 'This action wont have consequences.';
    document.body.appendChild(tooltip);
    
    // Position tooltip above rewind button
    const rewindRect = rewindBtn.getBoundingClientRect();
    tooltip.style.left = `${rewindRect.left}px`;
    tooltip.style.top = `${rewindRect.top - 60}px`;
    tooltip.style.display = 'block';
    
    // Wait for rewind click
    rewindBtn.onclick = () => {
        tooltip.remove();
        
        // Show navigation arrows by setting their opacity directly
        const prevButton = document.querySelector('.controls .prev');
        const nextButton = document.querySelector('.controls .next');
        
        // Set opacity directly on the buttons
        prevButton.style.opacity = '1';
        nextButton.style.opacity = '1';
        
        // Go to day 1
        currentDayIndex = 0;
        updateDisplay();
    };
}


// Initial loading sequence
async function startSequence() {
    // First load the data
    journeyDays = await loadJourneyData();
    
    // Start the loading animation
    const progressBar = document.querySelector('.loading-progress');
    progressBar.style.width = '100%';

    // Wait for 10 seconds with smooth transition
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Transition to seatbelt screen
    const loadingScreen = document.getElementById('loading-screen');
    const seatbeltScreen = document.getElementById('seatbelt-screen');
    
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        seatbeltScreen.style.display = 'flex';
        setTimeout(() => seatbeltScreen.style.opacity = '1', 100);
    }, 1000);

    // 3. Wait for user to click "I'm ready"
    await new Promise(resolve => {
        document.getElementById('ready-button').onclick = resolve;
    });

    // 4. Cloud transition
    seatbeltScreen.style.opacity = '0';
    const cloudTransition = document.querySelector('.cloud-transition');
    
    // Create clouds
    for(let i = 0; i < 10; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = `${Math.random() * 100}%`;
        cloud.style.width = `${100 + Math.random() * 100}px`;
        cloud.style.height = `${50 + Math.random() * 50}px`;
        cloud.style.animationDelay = `${i * 0.5}s`;
        cloudTransition.appendChild(cloud);
    }

    cloudTransition.style.opacity = '1';
    
    // 5. Show main content
    setTimeout(() => {
        seatbeltScreen.style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
        
        // Initialize to February 22
        initializeToCurrentDate();
        
        // Show previous day dots
        showPreviousDayDots();
        
        // Start tutorial
        setTimeout(startTutorial, 1000);
    }, 3000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation buttons
    document.querySelector('.prev').addEventListener('click', () => {
        if (currentDayIndex > 0) {
            currentDayIndex--;
            updateDisplay();
        }
    });

    document.querySelector('.next').addEventListener('click', () => {
        if (currentDayIndex < journeyDays.length - 1) {
            currentDayIndex++;
            updateDisplay();
        }
    });

    document.querySelector('.rewind').addEventListener('click', () => {
        currentDayIndex = 0;
        updateDisplay();
    });

    // Start the sequence
    startSequence();
});