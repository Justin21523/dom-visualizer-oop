
# DOM Visualizer OOP - 快速開始指南

## 🚀 立即測試 Foundation Module

### 步驟 1: 確認文件結構

請確保您的項目目錄結構如下：

```
dom-visualizer-oop/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── styles/
│   │   ├── main.css
│   │   ├── core/
│   │   │   ├── variables.css
│   │   │   └── reset.css
│   │   ├── modules/
│   │   │   └── foundation.css
│   │   ├── components/
│   │   │   ├── buttons.css
│   │   │   ├── forms.css
│   │   │   └── modals.css
│   │   ├── layout/
│   │   │   ├── header.css
│   │   │   ├── footer.css
│   │   │   └── navigation.css
│   │   └── themes/
│   │       ├── light.css
│   │       ├── dark.css
│   │       └── high-contrast.css
│   └── modules/
│       └── foundation/
│           ├── index.js
│           └── DOMMetricsVisualizer.js
└── tests/
    └── foundation-test.js
```

### 步驟 2: 更新主樣式文件

將剛才創建的完整樣式文件保存為 `src/styles/main.css`：

```css
/* 包含所有模組的完整樣式 */
@import './core/reset.css';
@import './core/variables.css';
/* ... 其他 import 語句 */
```

### 步驟 3: 更新 Foundation 模組樣式

將完整的 Foundation 樣式保存為 `src/styles/modules/foundation.css`。

### 步驟 4: 啟動開發服務器

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

### 步驟 5: 測試 Foundation Module

在瀏覽器中訪問：
- 主應用：`http://localhost:3000`
- 帶測試：`http://localhost:3000?test=foundation`

## 🧪 測試清單

### 基本功能測試

- [ ] **頁面載入** - 主頁面是否正常載入
- [ ] **模組卡片** - Foundation 模組卡片是否可見
- [ ] **點擊導航** - 點擊 Foundation 卡片是否進入模組
- [ ] **視覺化顯示** - DOM 容器視覺化是否正常顯示
- [ ] **控制面板** - 互動控制是否正常工作
- [ ] **即時更新** - 調整控制項時數值是否即時更新

### 互動功能測試

- [ ] **滑桿控制** - 視窗寬度/高度滑桿是否正常
- [ ] **滾動模擬** - 滾動位置控制是否有效
- [ ] **重置按鈕** - "Reset to Actual" 按鈕是否工作
- [ ] **全螢幕模擬** - "Fullscreen Simulation" 是否正常
- [ ] **自動更新** - Auto-update 核取方塊是否控制更新

### 視覺效果測試

- [ ] **Canvas 渲染** - Canvas 是否正確渲染容器
- [ ] **圖例顯示** - 顏色圖例是否清晰可見
- [ ] **動畫效果** - 數值變化時是否有平滑動畫
- [ ] **響應式設計** - 在不同螢幕尺寸下是否正常顯示
- [ ] **主題切換** - 亮色/暗色主題是否正常

## 🐛 常見問題排查

### 問題 1: 模組無法載入

**症狀**: 點擊 Foundation 卡片後顯示錯誤或空白頁面

**可能原因**:
- JavaScript 模組路徑錯誤
- ES6 模組導入/導出語法問題
- 瀏覽器不支援 ES6 模組

**解決方法**:
```javascript
// 檢查瀏覽器控制台錯誤訊息
// 確認模組路徑正確
// 使用現代瀏覽器（Chrome 80+, Firefox 75+）
```

### 問題 2: 樣式顯示異常

**症狀**: 佈局混亂或樣式未載入

**可能原因**:
- CSS 文件路徑錯誤
- CSS 變數未定義
- CSS import 順序錯誤

**解決方法**:
```css
/* 確認 variables.css 先載入 */
@import './core/variables.css';

/* 檢查 CSS 自定義屬性是否定義 */
:root {
  --primary-500: #3b82f6;
  /* ... 其他變數 */
}
```

### 問題 3: Canvas 無法顯示

**症狀**: 視覺化區域空白或顯示錯誤

**可能原因**:
- Canvas API 不可用
- 容器尺寸問題
- 渲染邏輯錯誤

**解決方法**:
```javascript
// 檢查瀏覽器支援
if (!HTMLCanvasElement.prototype.getContext) {
  console.error('Canvas not supported');
}

// 檢查容器尺寸
console.log('Container dimensions:', container.offsetWidth, container.offsetHeight);
```

### 問題 4: 控制項無回應

**症狀**: 滑桿或按鈕點擊無效果

**可能原因**:
- 事件監聽器未正確綁定
- JavaScript 錯誤中斷執行
- DOM 元素未找到

**解決方法**:
```javascript
// 檢查元素是否存在
const slider = document.querySelector('#window-width-control');
if (!slider) {
  console.error('Slider element not found');
}

// 檢查事件監聽器
slider.addEventListener('input', (e) => {
  console.log('Slider value changed:', e.target.value);
});
```

## 🔧 開發工具使用

### 開啟開發者工具

1. **開啟開發面板**: 點擊右下角的工具圖標 🔧
2. **查看 FPS**: 監控動畫性能
3. **檢查記憶體**: 觀察記憶體使用情況
4. **狀態偵錯**: 查看應用程式當前狀態

### 瀏覽器開發者工具

```javascript
// 在控制台中測試模組
const container = document.querySelector('#module-container');
const visualizer = new window.FoundationModule(container);

// 檢查模組狀態
console.log(visualizer.getStatus());

// 測試功能
visualizer.activate();
```

## 📊 性能監控

### 監控指標

- **FPS (每秒影格數)**: 應保持在 60 FPS
- **記憶體使用**: 應穩定不持續增長
- **載入時間**: 首次載入應在 2 秒內
- **互動響應**: 控制項響應應在 100ms 內

### 性能優化建議

```javascript
// 使用 requestAnimationFrame 進行動畫
function animate() {
  // 更新邏輯
  updateVisualization();
  requestAnimationFrame(animate);
}

// 節流處理高頻事件
const throttledUpdate = throttle(updateMetrics, 16); // 60 FPS
window.addEventListener('resize', throttledUpdate);

// 清理資源
visualizer.destroy(); // 移除事件監聽器和清理記憶體
```

## 📝 測試報告範本

```markdown
### Foundation Module 測試報告

**測試日期**: [日期]
**測試環境**: 
- 瀏覽器: [Chrome/Firefox/Safari] [版本]
- 作業系統: [Windows/macOS/Linux]
- 螢幕解析度: [寬度 x 高度]

**測試結果**:
- ✅ 基本載入: 正常
- ✅ 模組導航: 正常  
- ⚠️  視覺化顯示: 部分問題 - [描述問題]
- ✅ 互動控制: 正常
- ✅ 響應式設計: 正常

**發現的問題**:
1. [問題描述] - [嚴重程度: 高/中/低]
2. [問題描述] - [嚴重程度: 高/中/低]

**建議改進**:
1. [改進建議]
2. [改進建議]
```

## 🎯 下一步計劃

測試完成後，根據結果決定下一步行動：

### 如果測試順利通過 ✅
- 開始實作 Events Module
- 添加更多視覺化功能
- 優化性能和用戶體驗

### 如果發現問題 ⚠️
- 修復高優先級 bug
- 完善現有功能
- 增強錯誤處理

### 優化建議 🚀
- 添加單元測試覆蓋
- 實作 E2E 測試
- 改進無障礙功能
- 增強移動端體驗

## 💡 小貼士

1. **使用現代瀏覽器**: 確保支援 ES6 模組和現代 CSS 功能
2. **開啟開發者工具**: 監控錯誤和性能指標
3. **測試不同設備**: 在桌面、平板和手機上測試
4. **檢查網路**: 確保所有資源正確載入
5. **清除快取**: 如果遇到問題，嘗試強制重新載入（Ctrl+Shift+R）

---

如果您在測試過程中遇到任何問題，請查看瀏覽器控制台的錯誤訊息，並參考上述排查指南。我們可以根據測試結果進行進一步的優化和開發！
