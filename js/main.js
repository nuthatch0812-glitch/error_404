// ==========================================
// 1. 페이지 로드 시 초기화
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupScrollAnimations();
    setupMusicControl();
});

function initializePage() {
    console.log('Pottery history webpage initialized');
    setupScrollTracking();
    loadPotteryData();
}

// ==========================================
// 2. 음악 제어
// ==========================================
function setupMusicControl() {
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');

    if (!musicToggle || !bgMusic) return;

    musicToggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (bgMusic.paused) {
            bgMusic.volume = 0.3;
            bgMusic.play().then(() => {
                musicToggle.classList.add('playing');
                musicToggle.textContent = '🔊';
            }).catch(err => {
                console.log('음악 재생 오류:', err);
                musicToggle.textContent = '⚠️';
            });
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            musicToggle.textContent = '🔕';
        }
    });
}

// ==========================================
// 3. 스크롤 추적 및 섹션 활성화
// ==========================================
function setupScrollTracking() {
    const sections = [
        { id: 'hero', threshold: 0.5 },
        { id: 'crack-section', threshold: 0.3 },
        { id: 'map-section', threshold: 0.3 },
        { id: 'final-section', threshold: 0.3 },
        { id: 'gallery-section', threshold: 0.3 }
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                activateSection(entry.target.id);
            }
        });
    }, { threshold: [0.1, 0.3, 0.5] });

    sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) observer.observe(element);
    });

    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', throttle(function() {
        updateScrollIndicator();
        triggerAnimations();
    }, 50));
}

function activateSection(sectionId) {
    switch(sectionId) {
        case 'crack-section':
            setupCrackAnimation();
            break;
        case 'map-section':
            setupMapAnimation();
            break;
        case 'final-section':
            setupFinalAnimation();
            break;
        case 'gallery-section':
            setupGalleryAnimation();
            break;
    }
}

// ==========================================
// 4. 균열 애니메이션 (Canvas)
// ==========================================
let crackAnimationStarted = false;

function setupCrackAnimation() {
    if (crackAnimationStarted) return;
    crackAnimationStarted = true;

    const canvas = document.getElementById('crack-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Canvas 고해상도 설정
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const realWidth = rect.width;
    const realHeight = rect.height;

    window.addEventListener('scroll', function() {
        const crackSection = document.getElementById('crack-section');
        if (!crackSection) return;

        const sectionTop = crackSection.offsetTop;
        const sectionHeight = crackSection.offsetHeight;
        const scrollPos = window.scrollY;

        // 섹션 내 스크롤 진행도 계산 (0-1)
        const progress = Math.max(0, Math.min(1, (scrollPos - sectionTop + window.innerHeight) / (sectionHeight * 0.8)));
        
        animateCracks(ctx, realWidth, realHeight, progress);
    });
}

function animateCracks(ctx, width, height, progress) {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const potteryRadius = Math.min(80, width / 8);

    // 0-0.3: 금이 생기고 퍼지기
    if (progress < 0.3) {
        const crackProgress = progress / 0.3;
        drawPotteryWithCracks(ctx, centerX, centerY, potteryRadius, crackProgress);
    }
    // 0.3-1: 자기가 갈라지며 흩어지기
    else {
        const fragmentProgress = (progress - 0.3) / 0.7;
        drawFragmentedPottery(ctx, centerX, centerY, potteryRadius, fragmentProgress);
    }
}

function drawPotteryWithCracks(ctx, x, y, radius, crackIntensity) {
    // 자기 기본 형태
    ctx.fillStyle = '#fef5e7';
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(x, y, radius * 1.2, radius * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 붉은 문양
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.quadraticCurveTo(x - radius, y, x, y + radius * 0.3);
    ctx.quadraticCurveTo(x + radius, y, x + radius * 1.2, y + radius * 0.5);
    ctx.stroke();

    // 금 표현
    const crackLength = radius * 2 * crackIntensity;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.min(1, crackIntensity * 2);

    // 세로 금
    drawCrackLine(ctx, x, y - radius, x, y - radius + crackLength, crackIntensity);
    // 가로 금
    drawCrackLine(ctx, x - radius, y, x - radius + crackLength, y, crackIntensity);
    // 대각선 금
    drawCrackLine(ctx, x, y, x + crackLength * 0.7, y + crackLength * 0.7, crackIntensity);

    ctx.globalAlpha = 1;
}

function drawCrackLine(ctx, x1, y1, x2, y2, intensity) {
    // 금이 점진적으로 나타나는 효과
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const visibleDistance = distance * intensity;

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const endX = x1 + Math.cos(angle) * visibleDistance;
    const endY = y1 + Math.sin(angle) * visibleDistance;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function drawFragmentedPottery(ctx, x, y, radius, fragmentProgress) {
    const fragments = 6;
    const angle = (Math.PI * 2) / fragments;

    for (let i = 0; i < fragments; i++) {
        const fragmentAngle = angle * i;

        // 각 조각이 바깥쪽으로 흩어지기
        const distance = radius * 3 * fragmentProgress;
        const fragmentX = x + Math.cos(fragmentAngle) * distance;
        const fragmentY = y + Math.sin(fragmentAngle) * distance;

        // 회전 각도
        const rotationAngle = fragmentAngle + (fragmentProgress * Math.PI);

        ctx.save();
        ctx.translate(fragmentX, fragmentY);
        ctx.rotate(rotationAngle);

        // 조각 그리기
        ctx.fillStyle = '#fef5e7';
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.6, angle * i, angle * (i + 1));
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.stroke();

        // 조각에 붉은 문양 일부
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.5, angle * i, angle * (i + 0.8));
        ctx.stroke();

        ctx.restore();
    }
}

// ==========================================
// 5. 지도 애니메이션
// ==========================================
let mapAnimationStarted = false;

function setupMapAnimation() {
    if (mapAnimationStarted) return;
    mapAnimationStarted = true;

    const routeLine1 = document.getElementById('route-1');
    const routeLine2 = document.getElementById('route-2');

    if (!routeLine1 || !routeLine2) return;

    // 경로 그리기 애니메이션 시작
    setTimeout(() => {
        routeLine1.style.animation = 'drawPath 4s ease-in-out forwards';
        setTimeout(() => {
            routeLine2.style.animation = 'drawPath 2s ease-in-out forwards';
        }, 2000);
    }, 100);

    // 도공 정보 표시
    displayPottersOnMap();
}

function displayPottersOnMap() {
    const pottersInfo = document.getElementById('potters-info');
    if (!pottersInfo) return;

    const potters = [
        { name: '이삼평 (1647-1734)', x: 250, y: 180 },
        { name: '조선 도공들', x: 330, y: 200 },
        { name: '가라쓰 정착지', x: 420, y: 310 },
        { name: '아리타 자기의 발생지', x: 460, y: 330 }
    ];

    potters.forEach((potter, index) => {
        setTimeout(() => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', potter.x);
            text.setAttribute('y', potter.y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '12');
            text.setAttribute('fill', '#333');
            text.setAttribute('opacity', '0');
            text.textContent = potter.name;
            text.style.animation = 'fadeIn 1s ease-out forwards';

            pottersInfo.appendChild(text);
        }, index * 800);
    });
}

// ==========================================
// 6. 최종 섹션 애니메이션
// ==========================================
let finalAnimationStarted = false;

function setupFinalAnimation() {
    if (finalAnimationStarted) return;
    finalAnimationStarted = true;

    const potterCards = document.querySelectorAll('.potter-card');
    potterCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = `fadeInScale 0.6s ease-out ${index * 0.2}s both`;
        }, 100);
    });
}

// ==========================================
// 7. 갤러리 애니메이션
// ==========================================
let galleryAnimationStarted = false;

function setupGalleryAnimation() {
    if (galleryAnimationStarted) return;
    galleryAnimationStarted = true;

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.animation = `fadeInScale 0.6s ease-out ${index * 0.15}s both`;
        }, 100);
    });
}

// ==========================================
// 8. 일반 스크롤 애니메이션
// ==========================================
function setupScrollAnimations() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ==========================================
// 9. 스크롤 표시기 업데이트
// ==========================================
function updateScrollIndicator() {
    const scrollPos = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollPos / docHeight;

    const indicator = document.querySelector('.scroll-dot');
    if (!indicator) return;

    // 진행 상황에 따라 색상 변화
    if (scrollPercent < 0.25) {
        indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    } else if (scrollPercent < 0.5) {
        indicator.style.backgroundColor = 'rgba(211, 47, 47, 0.4)';
    } else if (scrollPercent < 0.75) {
        indicator.style.backgroundColor = 'rgba(211, 47, 47, 0.7)';
    } else {
        indicator.style.backgroundColor = '#d32f2f';
    }
}

// ==========================================
// 10. 도공 데이터 로드
// ==========================================
function loadPotteryData() {
    // pottery-data.json에서 도공 정보 로드
    // 여기서는 기본적으로 설정된 데이터 사용

    const pottersData = [
        {
            name: '이삼평',
            year: '1647-1734',
            contribution: '아리타 자기의 기초 개척자'
        },
        {
            name: '석우',
            year: '1660-1730',
            contribution: '의약용 도자기 개발'
        },
        {
            name: '임나',
            year: '1665-1735',
            contribution: '색채 문양 기법 발전'
        }
    ];

    console.log('도공 정보 로드됨:', pottersData);
}

// ==========================================
// 11. 유틸리티 함수
// ==========================================

// 스로틀 함수
function throttle(func, delay) {
    let timeout;
    return function() {
        if (!timeout) {
            timeout = setTimeout(() => {
                func();
                timeout = null;
            }, delay);
        }
    };
}

// 이징 함수들
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeOutCubic(t) {
    return 1 + (--t) * t * t;
}

// 거리 계산
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 트리거 애니메이션
function triggerAnimations() {
    const crackSection = document.getElementById('crack-section');
    if (crackSection && crackSection.classList.contains('visible')) {
        setupCrackAnimation();
    }

    const mapSection = document.getElementById('map-section');
    if (mapSection && mapSection.classList.contains('visible')) {
        setupMapAnimation();
    }

    const finalSection = document.getElementById('final-section');
    if (finalSection && finalSection.classList.contains('visible')) {
        setupFinalAnimation();
    }
}

// ==========================================
// 12. 윈도우 리사이즈 처리
// ==========================================
window.addEventListener('resize', function() {
    const canvas = document.getElementById('crack-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
});

// ==========================================
// 13. 페이지 가시성 처리
// ==========================================
document.addEventListener('visibilitychange', function() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    if (document.hidden) {
        bgMusic.pause();
    } else {
        if (!bgMusic.paused) {
            bgMusic.play();
        }
    }
});

// ==========================================
// 14. 접근성 개선
// ==========================================
document.addEventListener('keydown', function(e) {
    // Space 키로 음악 토글
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.click();
        }
    }
});

// ==========================================
// 15. 로그 (디버깅용)
// ==========================================
console.log('Main JavaScript loaded successfully');
console.log('Pottery history webpage by nuthatch0812-glitch');
console.log('감사의 메시지: 조선 도공들의 역사를 기억합니다.');
