A Chrome extension designed specifically for AI users to accurately track waiting time and total usage time during AI interactions, making every second of AI usage cost clearly visible ✨

Chinese Name: 等时仪表盘 | English Name: WaitDash | Positioning: A lightweight, accurate, and non-redundant AI usage time statistics tool

## 📌 Project Introduction

As a heavy AI user, have you ever wondered: when chatting with AI, half the time is spent waiting for responses? How much time do you actually spend on AI interactions?

WaitDash was born for this purpose — with minimalist design and accurate statistics at its core, it focuses on recording the entire interaction process between you and various AI tools (ChatGPT, Claude, domestic AI, etc.). It emphasizes tracking the "waiting time for AI responses" and also counts the total usage time, helping you intuitively grasp time allocation, optimize AI usage efficiency, and avoid ineffective waiting.

✅ No extra permissions, only counts AI interaction time to protect privacy
✅ Lightweight, no memory occupation, does not affect Chrome running speed
✅ Minimalist UI, intuitive data, ready to use
✅ Open source and free, customizable to adapt to more AI platforms

## 🚀 Core Features

- **Accurate Waiting Time Statistics**: Core feature! Automatically captures waiting time for AI responses, records in milliseconds, distinguishes between "active input time" and "AI waiting time", without missing any delay.

- **Total Usage Time Statistics**: Summarizes total AI tool usage time by day and hour, generates a simple data dashboard, allowing you to clearly see daily/weekly AI usage frequency at a glance.

- **Multi-AI Platform Adaptation**: Default adaptation to mainstream AI tools, supports custom addition of AI websites to flexibly adapt to your commonly used platforms.

- **Local Data Storage**: All statistical data is only stored locally in the browser, not uploaded to the server, fully protecting personal privacy.

- **Minimalist Visualization**: Hover over the plugin icon to view real-time data, click to enter the details page, data display is concise and non-redundant, no complex operations required.

## 🔧 Installation Guide (Chrome Browser)

### Method 1: Load Packaged Extension Locally (For Non-Developers)

1. Download the latest version of the `WaitDash.zip` compressed package from the Releases of this repository.

2. Open Chrome browser, enter the address `chrome://extensions/` to enter the extensions page.

3. Enable "Developer mode" in the upper right corner of the page.

4. Click "Load unpacked", select the uncompressed `WaitDash` folder, and the installation is complete.

### Method 2: Build from Source Code Locally (For Developers)

1. Clone this repository: `git clone https://github.com/gudao/waitdash.git`

2. Enter the project directory and install dependencies (if any): `npm install` (skip if no dependencies)

3. Repeat steps 2-4 of Method 1 to load the project root directory.

## 💡 Usage Instructions

1. After installation, the WaitDash plugin icon (minimalist Logo) will appear in the upper right corner of the Chrome browser.

2. Open any AI tool (such as ChatGPT), and the plugin will automatically start statistics when you begin interaction.

3. Hover over the plugin icon: You can quickly view "current session waiting time" and "today's total usage time".

4. Click the plugin icon: Enter the details page to view daily/weekly statistical data and the usage proportion of each AI platform.

5. Custom AI platforms: Add AI website domains in the "Settings" of the details page to adapt to more platforms.

## 🛠️ Technology Stack

Frontend: HTML + CSS + JavaScript
Plugin Development: Chrome Extension API
Data Storage: localStorage (local storage, privacy-first)
UI Design: Minimalist style, adapted to Chrome plugin interaction specifications

## 🤝 Contribution Guide

This project is open source and free. All AI enthusiasts and developers are welcome to participate in contributions to make WaitDash more complete!

1. Fork this repository

2. Create a feature branch: `git checkout -b feature/xxx`

3. Commit your code: `git commit -m "feat: add xxx feature"`

4. Push the branch: `git push origin feature/xxx`

5. Submit a Pull Request, explain the feature/fix content, and wait for review.

Reference contribution directions: Adapt to more AI platforms, optimize data statistics accuracy, add data export function, optimize UI interaction, etc.

## ❓ Frequently Asked Questions (FAQ)

- **Q: Will the plugin collect my AI conversation content?**
A: No! All data only records "time statistics information", does not capture or store any conversation content. All data is stored locally in the browser, and privacy is absolutely safe.

- **Q: Why can't some AI platforms be counted?**
A: Currently, it is adapted to mainstream AI platforms by default. If it cannot be counted, you can add the corresponding AI website domain in the "Settings" of the plugin details page, or submit an Issue, and I will adapt it as soon as possible.

- **Q: Is the counted waiting time accurate?**
A: Based on Chrome Extension API to monitor page interactions, it is counted in milliseconds with an error within 100ms, which can meet daily use and efficiency statistics needs.

## 📄 License

This project is open source under the MIT License. See the `LICENSE` file for details. You can freely use, modify and distribute it, provided that the original author is indicated.

## 💬 Contact Me

If you have feature suggestions or bug feedback, you can submit an Issue or contact me through the following methods:
GitHub: [https://github.com/gudao/waitdash](https://github.com/gudao/waitdash)
