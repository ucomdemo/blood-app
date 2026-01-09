// 從 localStorage 載入紀錄
let bloodPressureRecords = JSON.parse(localStorage.getItem('bloodPressureRecords')) || [];

// 頁面載入時顯示所有紀錄
document.addEventListener('DOMContentLoaded', function() {
    displayRecords();
    loadTheme();
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);
});

// 新增血壓紀錄
function addRecord() {
    // 取得輸入值
    const systolic = document.getElementById('systolic').value;
    const diastolic = document.getElementById('diastolic').value;
    const pulse = document.getElementById('pulse').value;
    const medication = document.getElementById('medication').value;
    const notes = document.getElementById('notes').value;
    
    // 驗證必填欄位
    if (!systolic || !diastolic || !pulse) {
        alert('請填寫收縮壓、舒張壓和脈搏！');
        return;
    }
    
    // 驗證數值範圍
    if (systolic < 0 || systolic > 300 || diastolic < 0 || diastolic > 200 || pulse < 0 || pulse > 300) {
        alert('請輸入有效的數值範圍！');
        return;
    }
    
    // 建立新紀錄
    const record = {
        id: Date.now(),
        datetime: new Date().toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: parseInt(pulse),
        medication: medication,
        notes: notes
    };
    
    // 加入陣列開頭（最新的在最上面）
    bloodPressureRecords.unshift(record);
    
    // 儲存到 localStorage
    localStorage.setItem('bloodPressureRecords', JSON.stringify(bloodPressureRecords));
    
    // 清空表單
    document.getElementById('systolic').value = '';
    document.getElementById('diastolic').value = '';
    document.getElementById('pulse').value = '';
    document.getElementById('medication').value = '無';
    document.getElementById('notes').value = '';
    
    // 重新顯示紀錄
    displayRecords();
    
    // 顯示成功訊息
    alert('血壓紀錄已成功新增！');
}

// 顯示所有紀錄
function displayRecords() {
    const recordsList = document.getElementById('recordsList');
    
    if (bloodPressureRecords.length === 0) {
        recordsList.innerHTML = '<div class="empty-message">目前沒有血壓紀錄</div>';
        return;
    }
    
    recordsList.innerHTML = '';
    
    bloodPressureRecords.forEach(record => {
        const recordCard = createRecordCard(record);
        recordsList.appendChild(recordCard);
    });
}

// 建立紀錄卡片
function createRecordCard(record) {
    const card = document.createElement('div');
    card.className = 'record-card ' + getBPCategory(record.systolic, record.diastolic);
    card.style.animation = 'recordSlideIn 0.5s ease-out';
    
    card.innerHTML = `
        <div class="record-header">
            <div class="record-datetime">📅 ${record.datetime}</div>
            <button class="delete-button" onclick="deleteRecord(${record.id})">刪除</button>
        </div>
        <div class="record-data">
            <div class="data-item">
                <span class="data-label">血壓</span>
                <span class="data-value bp-value">${record.systolic}/${record.diastolic}</span>
            </div>
            <div class="data-item">
                <span class="data-label">脈搏</span>
                <span class="data-value">${record.pulse} bpm</span>
            </div>
            <div class="data-item">
                <span class="data-label">藥物狀態</span>
                <span class="data-value">${getMedicationIcon(record.medication)} ${record.medication}</span>
            </div>
            <div class="data-item">
                <span class="data-label">血壓等級</span>
                <span class="data-value">${getBPLevel(record.systolic, record.diastolic)}</span>
            </div>
        </div>
        ${record.notes ? `
        <div class="record-notes">
            <span class="data-label">備註</span>
            <div class="data-value">${record.notes}</div>
        </div>
        ` : ''}
    `;
    
    return card;
}

// 取得血壓等級分類（用於樣式）
function getBPCategory(systolic, diastolic) {
    if (systolic >= 140 || diastolic >= 90) {
        return 'bp-high';
    } else if (systolic >= 120 || diastolic >= 80) {
        return 'bp-elevated';
    } else {
        return 'bp-normal';
    }
}

// 取得血壓等級描述
function getBPLevel(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) {
        return '⚠️ 高血壓危象';
    } else if (systolic >= 140 || diastolic >= 90) {
        return '🔴 高血壓';
    } else if (systolic >= 130 || diastolic >= 80) {
        return '🟡 高血壓前期';
    } else if (systolic >= 120 && diastolic < 80) {
        return '🟠 血壓偏高';
    } else {
        return '🟢 正常';
    }
}

// 取得藥物狀態圖示
function getMedicationIcon(medication) {
    switch(medication) {
        case '已服藥':
            return '💊';
        case '未服藥':
            return '⚠️';
        default:
            return '➖';
    }
}

// 刪除紀錄
function deleteRecord(id) {
    if (confirm('確定要刪除這筆紀錄嗎？')) {
        bloodPressureRecords = bloodPressureRecords.filter(record => record.id !== id);
        localStorage.setItem('bloodPressureRecords', JSON.stringify(bloodPressureRecords));
        displayRecords();
    }
}

// 允許按 Enter 鍵新增紀錄
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        addRecord();
    }
});

// 載入主題設定
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeIcon = document.querySelector('.theme-icon');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.textContent = '🌙';
    }
}

// 切換主題
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}