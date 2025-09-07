// Константы
const ACQUIRING_RATE = 0.025; // 2.5%
const TAX_RATES = {
    low: 0.02,   // 2%
    medium: 0.05, // 5%
    high: 0.07   // 7%
};

// Telegram Web App инициализация
let tg = null;
let isTelegramWebApp = false;

// Проверяем, запущено ли приложение в Telegram
if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    isTelegramWebApp = true;
    console.log('Telegram Web App detected');
}

// Функция для форматирования чисел
function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// Функция для форматирования процентов
function formatPercent(num, decimals = 2) {
    return formatNumber(num * 100, decimals) + '%';
}

// Функция для получения значения из поля ввода
function getInputValue(id) {
    const element = document.getElementById(id);
    const value = parseFloat(element.value) || 0;
    return value;
}

// Функция для валидации данных
function validateInputs() {
    const requiredFields = [
        'units-sold',
        'purchase-price',
        'selling-price'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        const value = getInputValue(fieldId);
        
        if (value <= 0) {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });
    
    return isValid;
}


// Основная функция расчета
function calculateEconomics() {
    // Валидация данных
    if (!validateInputs()) {
        alert('Пожалуйста, заполните все обязательные поля корректными значениями.');
        return;
    }
    
    // Получение данных из формы
    const data = {
        unitsSold: getInputValue('units-sold'),
        logistics: getInputValue('logistics'),
        fulfillment: getInputValue('fulfillment'),
        paidAcceptance: getInputValue('paid-acceptance'),
        wbCommission: getInputValue('wb-commission') / 100, // Конвертируем в десятичную дробь
        storageCost: getInputValue('storage-cost'),
        advertising: getInputValue('advertising'),
        purchasePrice: getInputValue('purchase-price'),
        sellingPrice: getInputValue('selling-price'),
        redemptionRate: getInputValue('redemption-rate') / 100 // Конвертируем в десятичную дробь
    };
    
    // Расчеты для одной единицы товара
    const unitCalculations = calculateUnitEconomics(data);
    
    // Расчеты для общего количества
    const totalCalculations = calculateTotalEconomics(data, unitCalculations);
    
    // Отображение результатов
    displayResults(unitCalculations, totalCalculations, data);
    
    // Добавляем класс для анимации
    document.querySelector('.results-section').classList.add('calculated');
    
    // Показываем главную кнопку Telegram после расчета
    if (isTelegramWebApp && tg) {
        tg.MainButton.show();
    }
}

// Расчет юнит-экономики для одной единицы
function calculateUnitEconomics(data) {
    const {
        logistics,
        fulfillment,
        paidAcceptance,
        wbCommission,
        storageCost,
        advertising,
        purchasePrice,
        sellingPrice,
        redemptionRate
    } = data;
    
    // Выручка с учетом процента выкупа
    const revenue = sellingPrice * redemptionRate;
    
    // Комиссия ВБ
    const wbCommissionAmount = revenue * wbCommission;
    
    // Эквайринг
    const acquiringAmount = revenue * ACQUIRING_RATE;
    
    // Общие расходы на единицу товара
    const totalCosts = purchasePrice + logistics + fulfillment + paidAcceptance + storageCost + advertising;
    
    // Налоги
    const taxes = {
        low: revenue * TAX_RATES.low,
        medium: revenue * TAX_RATES.medium,
        high: revenue * TAX_RATES.high
    };
    
    // Прибыль до налогов
    const profitBeforeTax = revenue - wbCommissionAmount - acquiringAmount - totalCosts;
    
    // Прибыль после налогов
    const profits = {
        low: profitBeforeTax - taxes.low,
        medium: profitBeforeTax - taxes.medium,
        high: profitBeforeTax - taxes.high
    };
    
    // Маржинальность (прибыль / выручка * 100)
    const margin = revenue > 0 ? (profitBeforeTax / revenue) * 100 : 0;
    
    // Рентабельность (прибыль / себестоимость * 100)
    const profitability = totalCosts > 0 ? (profitBeforeTax / totalCosts) * 100 : 0;
    
    return {
        revenue,
        wbCommissionAmount,
        acquiringAmount,
        totalCosts,
        taxes,
        profitBeforeTax,
        profits,
        margin,
        profitability
    };
}

// Расчет общей экономики
function calculateTotalEconomics(data, unitCalculations) {
    const { unitsSold } = data;
    
    return {
        totalRevenue: unitCalculations.revenue * unitsSold,
        totalWbCommission: unitCalculations.wbCommissionAmount * unitsSold,
        totalAcquiring: unitCalculations.acquiringAmount * unitsSold,
        totalCosts: unitCalculations.totalCosts * unitsSold,
        totalTaxes: {
            low: unitCalculations.taxes.low * unitsSold,
            medium: unitCalculations.taxes.medium * unitsSold,
            high: unitCalculations.taxes.high * unitsSold
        },
        totalProfitBeforeTax: unitCalculations.profitBeforeTax * unitsSold,
        totalProfits: {
            low: unitCalculations.profits.low * unitsSold,
            medium: unitCalculations.profits.medium * unitsSold,
            high: unitCalculations.profits.high * unitsSold
        }
    };
}

// Функции для работы с Telegram
function initTelegramWebApp() {
    if (isTelegramWebApp && tg) {
        // Настраиваем приложение
        tg.ready();
        tg.expand();
        
        // Применяем тему Telegram
        document.body.classList.add('telegram-webapp');
        
        // Настраиваем главную кнопку для быстрого обмена результатами
        tg.MainButton.setText('📊 Поделиться результатами');
        tg.MainButton.hide(); // Скрываем до выполнения расчета
        tg.MainButton.onClick(shareResults);
        
        // Настраиваем кнопку "Назад"
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
            tg.close();
        });
        
        console.log('Telegram Web App initialized');
        console.log('User:', tg.initDataUnsafe.user);
        
        // Показываем приветственное уведомление
        setTimeout(() => {
            tg.showPopup({
                title: '👋 Добро пожаловать!',
                message: 'Калькулятор юнит-экономики готов к работе.\n\n📊 Выполните расчет\n📤 Используйте "Экспорт" для отправки данных\n📱 Или "Поделиться" для быстрого обмена',
                buttons: [{type: 'ok', text: 'Понятно'}]
            });
        }, 500);
    }
}


function shareResults() {
    if (!isTelegramWebApp || !tg) return;
    
    const results = getCurrentResults();
    const message = formatResultsForSharing(results);
    
    // Отправляем данные в Telegram
    tg.sendData(JSON.stringify({
        type: 'unit_economics_results',
        data: results,
        message: message
    }));
    
    // Показываем уведомление
    tg.showAlert('Результаты отправлены!');
}

function getCurrentResults() {
    return {
        timestamp: new Date().toLocaleString('ru-RU'),
        inputs: {
            unitsSold: getInputValue('units-sold'),
            logistics: getInputValue('logistics'),
            fulfillment: getInputValue('fulfillment'),
            paidAcceptance: getInputValue('paid-acceptance'),
            wbCommission: getInputValue('wb-commission'),
            storageCost: getInputValue('storage-cost'),
            advertising: getInputValue('advertising'),
            purchasePrice: getInputValue('purchase-price'),
            sellingPrice: getInputValue('selling-price'),
            redemptionRate: getInputValue('redemption-rate')
        },
        results: {
            margin: document.getElementById('margin').textContent,
            profitability: document.getElementById('profitability').textContent,
            profit5: document.getElementById('profit-5').textContent,
            profit7: document.getElementById('profit-7').textContent,
            profit2: document.getElementById('profit-2').textContent
        }
    };
}

function formatResultsForSharing(results) {
    const { inputs, results: calcResults } = results;
    
    return `📊 *Результаты расчета юнит-экономики*

💰 *Основные параметры:*
• Продано единиц: ${inputs.unitsSold}
• Цена продажи: ${inputs.sellingPrice} руб.
• Закупочная цена: ${inputs.purchasePrice} руб.
• Комиссия ВБ: ${inputs.wbCommission}%

📈 *Результаты:*
• Маржинальность: ${calcResults.margin}
• Рентабельность: ${calcResults.profitability}
• Прибыль (5%): ${calcResults.profit5}
• Прибыль (7%): ${calcResults.profit7}
• Прибыль (2%): ${calcResults.profit2}

🤖 *Калькулятор:* @MaksimovWB`;
}

function formatExportForTelegram(results) {
    const { inputs, results: calcResults } = results;
    
    return `📊 *ЭКСПОРТ РАСЧЕТА ЮНИТ-ЭКОНОМИКИ*
🕐 *Дата:* ${results.timestamp}

💼 *ВХОДНЫЕ ДАННЫЕ:*
• Продано единиц: ${inputs.unitsSold}
• Цена продажи: ${formatNumber(inputs.sellingPrice)} руб.
• Закупочная цена: ${formatNumber(inputs.purchasePrice)} руб.
• Логистика ВБ: ${formatNumber(inputs.logistics)} руб.
• Фулфилмент: ${formatNumber(inputs.fulfillment)} руб.
• Платная приемка: ${formatNumber(inputs.paidAcceptance)} руб.
• Комиссия ВБ: ${inputs.wbCommission}%
• Стоимость хранения: ${formatNumber(inputs.storageCost)} руб.
• Реклама: ${formatNumber(inputs.advertising)} руб.
• Процент выкупа: ${inputs.redemptionRate}%

💰 *НАЛОГООБЛОЖЕНИЕ:*
• Налог 2%: ${calcResults.tax2}
• Налог 5%: ${calcResults.tax5}
• Налог 7%: ${calcResults.tax7}

📈 *ПРИБЫЛЬ ПОСЛЕ НАЛОГОВ:*
• При ставке 2%: ${calcResults.profit2}
• При ставке 5%: ${calcResults.profit5}
• При ставке 7%: ${calcResults.profit7}

🎯 *КЛЮЧЕВЫЕ МЕТРИКИ:*
• Маржинальность: ${calcResults.margin}
• Рентабельность: ${calcResults.profitability}

📋 *ДЕТАЛЬНАЯ СВОДКА:*
Общая себестоимость = Закупочная цена + Логистика + Фулфилмент + Платная приемка + Хранение + Реклама

🤖 *Калькулятор создан:* [@MaksimovWB](https://t.me/MaksimovWB)
📱 *Для селлеров Wildberries*`;
}

// Отображение результатов
function displayResults(unitCalculations, totalCalculations, data) {
    // Налоги
    document.getElementById('tax-5').textContent = formatNumber(unitCalculations.taxes.medium) + ' руб.';
    document.getElementById('tax-7').textContent = formatNumber(unitCalculations.taxes.high) + ' руб.';
    document.getElementById('tax-2').textContent = formatNumber(unitCalculations.taxes.low) + ' руб.';
    
    // Прибыль
    document.getElementById('profit-5').textContent = formatNumber(unitCalculations.profits.medium) + ' руб.';
    document.getElementById('profit-7').textContent = formatNumber(unitCalculations.profits.high) + ' руб.';
    document.getElementById('profit-2').textContent = formatNumber(unitCalculations.profits.low) + ' руб.';
    
    // Ключевые метрики
    document.getElementById('margin').textContent = formatPercent(unitCalculations.margin / 100);
    document.getElementById('profitability').textContent = formatPercent(unitCalculations.profitability / 100);
    
    // Сводка по единице товара
    const summaryElement = document.getElementById('unit-summary');
    summaryElement.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
                <strong>Выручка с единицы:</strong><br>
                ${formatNumber(unitCalculations.revenue)} руб.
            </div>
            <div>
                <strong>Себестоимость единицы:</strong><br>
                ${formatNumber(unitCalculations.totalCosts)} руб.
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
                <strong>Комиссия ВБ:</strong><br>
                ${formatNumber(unitCalculations.wbCommissionAmount)} руб.
            </div>
            <div>
                <strong>Эквайринг:</strong><br>
                ${formatNumber(unitCalculations.acquiringAmount)} руб.
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
                <strong>Логистика ВБ:</strong><br>
                ${formatNumber(data.logistics)} руб.
            </div>
            <div>
                <strong>Фулфилмент:</strong><br>
                ${formatNumber(data.fulfillment)} руб.
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
                <strong>Платная приемка:</strong><br>
                ${formatNumber(data.paidAcceptance)} руб.
            </div>
            <div>
                <strong>Хранение:</strong><br>
                ${formatNumber(data.storageCost)} руб.
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 15px; border-radius: 10px; margin-top: 15px;">
            <strong>Общая сводка (${data.unitsSold} единиц):</strong><br>
            • Общая выручка: ${formatNumber(totalCalculations.totalRevenue)} руб.<br>
            • Общие расходы: ${formatNumber(totalCalculations.totalCosts)} руб.<br>
            • Прибыль до налогов: ${formatNumber(totalCalculations.totalProfitBeforeTax)} руб.<br>
            • Лучшая прибыль (2%): ${formatNumber(totalCalculations.totalProfits.low)} руб.
        </div>
    `;
}

// Функция для очистки формы
function clearForm() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error');
    });
    
    // Очищаем результаты
    const resultElements = document.querySelectorAll('.value');
    resultElements.forEach(element => {
        if (element.id) {
            element.textContent = '0.00 руб.';
        }
    });
    
    document.getElementById('margin').textContent = '0.00%';
    document.getElementById('profitability').textContent = '0.00%';
    document.getElementById('unit-summary').innerHTML = '<p>Заполните данные для расчета</p>';
    
    document.querySelector('.results-section').classList.remove('calculated');
    
    // Скрываем главную кнопку Telegram при очистке
    if (isTelegramWebApp && tg) {
        tg.MainButton.hide();
    }
}

// Функция для экспорта результатов
function exportResults() {
    // Проверяем, есть ли результаты для экспорта
    const margin = document.getElementById('margin').textContent;
    if (margin === '0.00%') {
        alert('Сначала выполните расчет, а затем экспортируйте результаты.');
        return;
    }

    const results = {
        timestamp: new Date().toLocaleString('ru-RU'),
        inputs: {
            unitsSold: getInputValue('units-sold'),
            logistics: getInputValue('logistics'),
            fulfillment: getInputValue('fulfillment'),
            paidAcceptance: getInputValue('paid-acceptance'),
            wbCommission: getInputValue('wb-commission'),
            storageCost: getInputValue('storage-cost'),
            advertising: getInputValue('advertising'),
            purchasePrice: getInputValue('purchase-price'),
            sellingPrice: getInputValue('selling-price'),
            redemptionRate: getInputValue('redemption-rate')
        },
        results: {
            margin: document.getElementById('margin').textContent,
            profitability: document.getElementById('profitability').textContent,
            profit5: document.getElementById('profit-5').textContent,
            profit7: document.getElementById('profit-7').textContent,
            profit2: document.getElementById('profit-2').textContent,
            tax5: document.getElementById('tax-5').textContent,
            tax7: document.getElementById('tax-7').textContent,
            tax2: document.getElementById('tax-2').textContent
        }
    };
    
    // Если запущено в Telegram Web App - отправляем данные боту
    if (isTelegramWebApp && tg) {
        const exportMessage = formatExportForTelegram(results);
        
        // Отправляем данные боту
        tg.sendData(JSON.stringify({
            type: 'export_results',
            data: results,
            message: exportMessage
        }));
        
        // Показываем уведомление
        tg.showAlert('📊 Результаты расчета отправлены!');
        
        // Логируем для отладки
        console.log('Export data sent to Telegram bot:', results);
    } else {
        // Обычный экспорт в файл для браузера
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `unit-economics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        // Показываем уведомление для браузера
        alert('📊 Результаты экспортированы в файл!');
    }
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Telegram Web App
    initTelegramWebApp();
    
    // Автоматический расчет при изменении полей
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Убираем класс ошибки при вводе
            this.classList.remove('error');
        });
    });
    
    // Обработка Enter в полях ввода
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateEconomics();
            }
        });
    });
    
    // Добавляем кнопки управления
    const inputSection = document.querySelector('.input-section');
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 20px;';
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Очистить';
    clearBtn.className = 'calculate-btn';
    clearBtn.style.cssText = 'background: #6c757d; flex: 1;';
    clearBtn.onclick = clearForm;
    
    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Экспорт';
    exportBtn.className = 'calculate-btn';
    exportBtn.style.cssText = 'background: #28a745; flex: 1;';
    exportBtn.onclick = exportResults;
    
    buttonContainer.appendChild(clearBtn);
    buttonContainer.appendChild(exportBtn);
    inputSection.appendChild(buttonContainer);
});

// Функция для демонстрации с примерными данными
function loadExampleData() {
    document.getElementById('units-sold').value = '100';
    document.getElementById('logistics').value = '25.50';
    document.getElementById('fulfillment').value = '15.00';
    document.getElementById('paid-acceptance').value = '8.00';
    document.getElementById('wb-commission').value = '15.5';
    document.getElementById('storage-cost').value = '5.00';
    document.getElementById('advertising').value = '50.00';
    document.getElementById('purchase-price').value = '200.00';
    document.getElementById('selling-price').value = '450.00';
    document.getElementById('redemption-rate').value = '85';
    
    calculateEconomics();
}

// Добавляем кнопку для загрузки примера
document.addEventListener('DOMContentLoaded', function() {
    // Находим существующий контейнер кнопок
    const buttonsContainer = document.querySelector('.header-buttons');
    
    // Создаем кнопку "Загрузить пример"
    const exampleBtn = document.createElement('button');
    exampleBtn.innerHTML = '<i class="fas fa-magic"></i> Загрузить пример';
    exampleBtn.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: 1px solid rgba(102, 126, 234, 0.3);
        padding: 12px 20px;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 600;
        margin-top: 0;
        margin-left: 0;
        transition: all 0.3s ease;
        font-size: 0.875rem;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        flex: 1;
        justify-content: center;
        box-shadow: 
            0 4px 16px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    `;
    exampleBtn.onclick = loadExampleData;
    exampleBtn.onmouseover = function() {
        this.style.background = 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
    };
    exampleBtn.onmouseout = function() {
        this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
    };
    
    // Добавляем кнопку в существующий контейнер
    buttonsContainer.appendChild(exampleBtn);
});
