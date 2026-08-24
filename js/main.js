// ==========================================
// 1. 페이지 로드 시 초기화
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupScrollAnimations();
});

function initializePage() {
    console.log('Page initialized');
    drawInitialPottery();
    setupCrackCanvas();
    setupMigrationMap();
    setupReassembledPottery();
}

// ==========================================
// 2. 첫 번째 섹션: 아리타 자기 그리기
// ==========================================
function drawInitialPottery() {
    const svg = document.getElementById('pottery-svg');
    
    // 자기 기본 형태는 이미 HTML에 있음
    // 필요시 동적으로 업데이트
    addPotteryDecorations(svg);
}

function addPotteryDecorations(svg) {
    const pottery = svg.querySelector('.pottery');
    
    // 추가 장식 패턴들
    const decorativeCircles = [
        { cx: 160, cy: 160, r: 5 },
        { cx: 240, cy: 160, r: 5 },
        { cx: 200, cy: 280, r: 5 }
    ];
    
    decorativeCircles.forEach(circle => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.setAttribute('cx', circle.cx);
        el.setAttribute('cy', circle.cy);
        el.setAttribute('r', circle.r);
        el.setAttribute('fill', '#d32f2f');
        el.setAttribute('opacity', '0.6');
        pottery.appendChild(el);
    });
}

// ==========================================
// 3. 두 번째 섹션: 균열 애니메이션 (Canvas)
// ==========================================
function setupCrackCanvas() {
    const canvas = document.getElementById('crack-canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas 고해상도 설정
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    
    const realWidth = canvas.offsetWidth;
    const realHeight = canvas.offsetHeight;
    
    // 초기 자기 그리기
    let crackProgress = 0;
    let potteryPieces = [];
    let isAnimating = false;
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', function() {
        const crackSection = document.getElementById('crack-section');
        const sectionTop = crackSection.offsetTop;
        const sectionHeight = crackSection.offsetHeight;
        const scrollPos = window.scrollY;
        
        // 섹션 내 스크롤 진행도 계산 (0-1)
        const progress = Math.max(0, Math.min(1, (scrollPos - sectionTop) / sectionHeight));
        crackProgress = progress;
        
        animateCracks(ctx, realWidth, realHeight, progress, potteryPieces);
    });
}

function animateCracks(ctx, width, height, progress, potteryPieces) {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const potteryRadius = 80;
    
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
// 4. 세 번째 섹션: 마이그레이션 맵
// ==========================================
function setupMigrationMap() {
    const mapSection = document.getElementById('map-section');
    const migrationMap = document.getElementById('migration-map');
    const routeLine = document.getElementById('route-line');
    const pottersInfo = document.getElementById('potters-info');
    
    // 도공 정보 (이름, 연도, 위치)
    const potters = [
        { name: '이삼평', year: '1647-1734', x: 230, y: 200 },
        { name: '기타에이', year: '1650-1720', x: 330, y: 225 },
        { name: '사카이다', year: '1670-1745', x: 430, y: 280 }
    ];
    
    // 스크롤 이벤트
    window.addEventListener('scroll', function() {
        const sectionTop = mapSection.offsetTop;
        const sectionHeight = mapSection.offsetHeight;
        const scrollPos = window.scrollY;
        
        const progress = Math.max(0, Math.min(1, (scrollPos - sectionTop + window.innerHeight / 2) / (sectionHeight / 2)));
        
        // 경로선 그리기 애니메이션
        if (progress > 0) {
            routeLine.style.strokeDashoffset = (1 - progress) * 1000;
        }
        
        // 도공 정보 나타내기
        if (progress > 0.5) {
            const infoProgress = (progress - 0.5) / 0.5;
            displayPottersInfo(pottersInfo, potters, infoProgress);
        }
    });
}

function displayPottersInfo(container, potters, progress) {
    // 기존 텍스트 제거
    container.querySelectorAll('text').forEach(el => el.remove());
    
    potters.forEach((potter, index) => {
        if (progress * potters.length > index) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', potter.x);
            text.setAttribute('y', potter.y - 20);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'potter-name');
            text.textContent = potter.name;
            text.style.opacity = Math.min(1, (progress * potters.length - index) * 2);
            
            const yearText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            yearText.setAttribute('x', potter.x);
            yearText.setAttribute('y', potter.y + 5);
            yearText.setAttribute('text-anchor', 'middle');
            yearText.setAttribute('font-size', '12');
            yearText.setAttribute('fill', '#999');
            yearText.textContent = potter.year;
            yearText.style.opacity = Math.min(1, (progress * potters.length - index) * 2);
            
            container.appendChild(text);
            container.appendChild(yearText);
        }
    });
}

// ==========================================
// 5. 네 번째 섹션: 재결합된 자기
// ==========================================
function setupReassembledPottery() {
    const finalSection = document.getElementById('final-section');
    const reassembledSvg = document.getElementById('reassembled-svg');
    const reassembledMain = document.getElementById('reassembled-pottery-main');
    const crackText = document.getElementById('crack-text');
    
    // 도공 정보와 연도
    const pottersCracks = [
        { name: '이삼평', year: '1647', position: 'top' },
        { name: '사카이다', year: '1670', position: 'right' },
        { name: '기타에이', year: '1680', position: 'bottom' },
        { name: '도키자에몬', year: '1700', position: 'left' },
        { name: '석우', year: '1720', position: 'topRight' },
        { name: '임나', year: '1740', position: 'bottomLeft' }
    ];
    
    // 스크롤 이벤트
    window.addEventListener('scroll', function() {
        const sectionTop = finalSection.offsetTop;
        const sectionHeight = finalSection.offsetHeight;
        const scrollPos = window.scrollY;
        
        const progress = Math.max(0, Math.min(1, (scrollPos - sectionTop + window.innerHeight / 2) / (sectionHeight / 2)));
        
        // 조각들 재결합
        animateReassembly(reassembledMain, progress);
        
        // 균열 텍스트 표시
        if (progress > 0.5) {
            displayCrackAnnotations(crackText, pottersCracks, (progress - 0.5) / 0.5);
        }
    });
    
    // 초기 자기 그리기
    drawReassembledPottery(reassembledMain);
}

function drawReassembledPottery(container) {
    // 초기 재결합된 자기 형태
    const pottery = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    pottery.setAttribute('id', 'reassembled-base');
    pottery.setAttribute('cx', '300');
    pottery.setAttribute('cy', '300');
    pottery.setAttribute('rx', '120');
    pottery.setAttribute('ry', '140');
    pottery.setAttribute('fill', '#fef5e7');
    pottery.setAttribute('stroke', '#8b7355');
    pottery.setAttribute('stroke-width', '2');
    
    container.appendChild(pottery);
}

function animateReassembly(container, progress) {
    const pieces = container.querySelectorAll('.pottery-piece');
    
    // 진행도에 따라 조각들을 원래 위치로 모으기
    if (pieces.length === 0) {
        // 조각들이 없으면 생성
        createPotteryPieces(container, progress);
    } else {
        // 기존 조각들 위치 업데이트
        updatePiecesPosition(pieces, progress);
    }
}

function createPotteryPieces(container, progress) {
    const fragmentCount = 6;
    const angle = (Math.PI * 2) / fragmentCount;
    const centerX = 300;
    const centerY = 300;
    const maxDistance = 200;
    
    for (let i = 0; i < fragmentCount; i++) {
        const fragmentAngle = angle * i;
        
        // 흩어진 위치에서 중심으로 돌아오기
        const distance = maxDistance * (1 - progress);
        const x = centerX + Math.cos(fragmentAngle) * distance;
        const y = centerY + Math.sin(fragmentAngle) * distance;
        
        const piece = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        piece.setAttribute('class', 'pottery-piece');
        piece.setAttribute('id', `piece-${i}`);
        piece.setAttribute('transform', `translate(${x}, ${y}) rotate(${fragmentAngle * 57.3})`);
        
        // 조각 모양
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M 0 -100 A 100 100 0 0 1 71 -71 L 0 0 Z`);
        path.setAttribute('fill', '#fef5e7');
        path.setAttribute('stroke', '#8b7355');
        path.setAttribute('stroke-width', '2');
        
        piece.appendChild(path);
        container.appendChild(piece);
    }
}

function updatePiecesPosition(pieces, progress) {
    const centerX = 300;
    const centerY = 300;
    const maxDistance = 200;
    const fragmentCount = pieces.length;
    const angle = (Math.PI * 2) / fragmentCount;
    
    pieces.forEach((piece, index) => {
        const fragmentAngle = angle * index;
        const distance = maxDistance * (1 - progress);
        const x = centerX + Math.cos(fragmentAngle) * distance;
        const y = centerY + Math.sin(fragmentAngle) * distance;
        
        piece.setAttribute('transform', `translate(${x}, ${y}) rotate(${fragmentAngle * 57.3})`);
    });
}

function displayCrackAnnotations(container, potters, progress) {
    container.querySelectorAll('text').forEach(el => el.remove());
    
    const positions = {
        'top': { x: 300, y: 150 },
        'right': { x: 420, y: 300 },
        'bottom': { x: 300, y: 450 },
        'left': { x: 180, y: 300 },
        'topRight': { x: 360, y: 220 },
        'bottomLeft': { x: 240, y: 380 }
    };
    
    potters.forEach((potter, index) => {
        if (progress * potters.length > index) {
            const pos = positions[potter.position];
            
            const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            nameText.setAttribute('x', pos.x);
            nameText.setAttribute('y', pos.y);
            nameText.setAttribute('text-anchor', 'middle');
            nameText.setAttribute('font-size', '14');
            nameText.setAttribute('font-weight', 'bold');
            nameText.textContent = potter.name;
            nameText.style.opacity = Math.min(1, (progress * potters.length - index) * 2);
            
            const yearText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            yearText.setAttribute('x', pos.x);
            yearText.setAttribute('y', pos.y + 18);
            yearText.setAttribute('text-anchor', 'middle');
            yearText.setAttribute('font-size', '12');
            yearText.setAttribute('fill', '#666');
            yearText.textContent = potter.year;
            yearText.style.opacity = Math.min(1, (progress * potters.length - index) * 2);
            
            container.appendChild(nameText);
            container.appendChild(yearText);
        }
    });
}

// ==========================================
// 6. 스크롤 애니메이션 일반 설정
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
// 7. 유틸리티 함수
// ==========================================

// 부드러운 이징 함수
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

// ==========================================
// 8. 윈도우 리사이즈 처리
// ==========================================
window.addEventListener('resize', function() {
    const canvas = document.getElementById('crack-canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
});

// 콘솔 로그 (디버깅용)
console.log('Main JavaScript loaded successfully');
