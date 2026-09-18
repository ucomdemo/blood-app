# Plan：新增 Light/Dark 佈景主題

為現有血壓管理 App 新增 Light/Dark 主題切換。保留目前 Light 配色，首頁 header 右上角加入 Sun/Moon 圖示按鈕，首次使用預設 Light，使用者選擇以 `localStorage` 保存。

## 步驟

1. 在 `index.html` 的 header 加入主題切換按鈕，保留標題置中，按鈕放在右上角，並加入 `type`、`aria-label` 等無障礙資訊。
2. 在 `style.css`：
   - 保留現有 Light 配色。
   - 新增 Dark 主題語意色彩變數。
   - 覆蓋背景、卡片、文字、邊框、表單、按鈕、紀錄項目與狀態標籤顏色。
   - 確保桌面與手機版 header 不重疊、不溢出。
3. 在 `script.js`：
   - 新增獨立的主題 `localStorage` key。
   - 讀取並驗證 `light`/`dark` 值。
   - 無儲存值時套用 Light。
   - 點擊按鈕時切換主題、更新圖示與 `aria-label`，並保存選擇。
   - 保持既有血壓紀錄儲存與表單流程不變。
4. 初始化時先套用主題，再執行既有紀錄渲染；若儲存讀寫失敗，維持 Light 且不影響血壓功能。

## 相關檔案

- `index.html` — header 標題區與主題按鈕標記。
- `style.css` — Light/Dark 語意變數、Dark 覆寫、header 與圖示按鈕樣式。
- `script.js` — 主題初始化、切換、`localStorage` 保存與無障礙狀態更新；沿用既有 `localStorage` 模式。

## 驗證

1. 以瀏覽器開啟 `index.html`，確認無主題偏好時顯示 Light，標題仍置中，Sun/Moon 按鈕在 header 右上角且不遮擋內容。
2. 點擊按鈕，確認頁面所有主要區域立即切換 Dark，圖示與 `aria-label` 反映下一個可執行動作或目前主題，表單與紀錄清單仍可正常操作。
3. 重新整理頁面，確認選擇仍維持；在 DevTools 清除主題儲存值後重新整理，確認回到 Light。
4. 以桌面與窄手機寬度檢查 header、按鈕、表單欄位及紀錄卡片沒有重疊或水平溢出。
5. 使用瀏覽器檢查 Console 無 JavaScript 錯誤，並確認既有新增紀錄與清除全部流程未受影響。

## 決策

- 預設主題固定為 Light，不讀取或跟隨作業系統的深色偏好。
- 使用 Sun/Moon 圖示按鈕，不改成分段按鈕或文字 Toggle；會補足 tooltip/`aria-label` 等可理解性資訊。
- Light 主題保留現有配色；Dark 僅新增對應語意色。
- 切換不加入平滑動畫，立即更新。
- 使用瀏覽器 `localStorage` 保存；不納入帳號、後端或跨裝置同步。
- 不修改血壓紀錄資料格式、既有紀錄儲存鍵與表單功能。

## 範圍外

- 不新增框架、外部圖示套件、登入功能或後端同步。
- 不重新設計整個 App 的版面與 Light 主題。
