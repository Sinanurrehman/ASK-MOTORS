# ASK MOTORS — Vehicle Registration, Commercial Excise & Accounts Management System

A production-grade, full-stack cross-platform application for vehicle registration, commercial excise compliance, and double-entry ledger accounting, with real-time cloud synchronization powered by Google Firebase.

---

## 🌟 Key Capabilities

1. **Vehicle File Dockets**:
   - Manage Old & New registration numbers, vehicle types (*Private / Commercial*), chassis and engine numbers, owner details, and excise receipt numbers.
   - **Real-Time Duplicate Detection**: Automatically flags duplicate registrations or chassis numbers across all historical dockets before saving.
   - **Physical File Tracking**: Toggle between *In Office* and *✔ Returned* with recipient name and delivery date recording.

2. **Sequential Commercial Compliance**:
   - Specialized workflow stages: **MVI → Fitness → NOC → Route Permit**.
   - Sequence warnings if dependent steps are completed out of order.

3. **Double-Entry Accounting & Ledger**:
   - **Parties, Dealers & Customers**: Complete running debit/credit ledger tracking excise fees, service charges, advances, and outstanding balances.
   - **Outsource / Subcontractor Expense Payouts**: Record outsource payments to insurance companies, passing agents, and MVI centers to automatically compute net office margin.
   - **Printable Receipts & Slips**: One-click printable receipts, vehicle job slips, and account statements formatted for thermal and standard A4 printers.
   - **WhatsApp Integration**: Instant 1-click formatted statement and file progress updates sent directly to customers and dealers.

4. **100% Free Long-Term Cloud & Offline-First**:
   - Built on Firebase Firestore with **Google Cloud Enterprise security**.
   - Runs entirely within Firebase's permanent free tier (**50,000 reads/day**, **20,000 writes/day**, **1 GB storage** at $0 cost forever).
   - **Offline-First Persistence**: Operates seamlessly when internet is disconnected and automatically syncs changes across all phones and computers the moment network restores.

---

## 💻 Windows Desktop Installation (اردو & English)

### INSTALL KAISE KAREIN (Windows PC / Laptop)
1. Browser mein app open karein (Google Chrome ya Microsoft Edge).
2. Address bar ke bilkul right corner par **Install App (⊕ ya Monitor Icon)** par click karein.
   *(Ya browser ke menu `⋮` mein ja kar **Save and Share → Install page as app** dabayein).*
3. **Install** dabayein.
4. Aap ke Desktop aur Start Menu par **"ASK MOTORS"** ka shortcut ban jayega.
5. Aage se seedha Desktop wale icon par double-click karke bina browser borders ke desktop software ki tarah use karein!

*(Agar offline chalana ho to app pehle se cached hoti hai aur bina internet ke bhi foran open hoti hai).*

---

## 📱 Mobile App Installation (Android & iPhone)

### Android (Chrome / Brave / Edge)
1. Mobile Chrome browser mein application ka link open karein.
2. Upar right corner par `⋮` (teen dots) dabayein.
3. **"Install app"** ya **"Add to Home screen"** par click karein.
4. Mobile home screen par ASK MOTORS ka icon ban jayega. Yeh baghair kisi Play Store account ke native mobile app ban jati hai.

### iPhone / iPad (Safari)
1. Safari browser mein app ka link open karein.
2. Screen ke bottom mein **Share (□↑)** button dabayein.
3. Scroll karke **"Add to Home Screen"** chunein, aur phir **Add** dabayein.

---

## 🔐 Team Authentication & Private App Access

1. **Owner Account**:
   - Primary Owner: `sinanurrehman@gmail.com`
   - Owner ke paas mukammal control hota hai: files delete karna, database backup lena, aur staff members ko invite karna.

2. **Staff Members ko Add Karna**:
   - Topbar mein **"Cloud & Team Access"** button dabayein.
   - Owner account se login karein.
   - **"Team Members Access Control"** section mein apne staff member ka Google Email type karein aur **"Add Staff"** dabayein.
   - Ab wo staff member apne mobile ya computer par apna Google account login karega to foran office database se connect ho jayega aur live entry kar sakega.

---

## 🚀 Deployment Instructions

### GitHub Push & Version Control (Git Setup)
To push this complete source code to your GitHub account for version control and future updates:
```bash
# 1. Initialize git repository
git init

# 2. Add all source files
git add .

# 3. Create initial commit
git commit -m "ASK MOTORS full-stack production release"

# 4. Rename branch to main
git branch -M main

# 5. Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/ask-motors.git

# 6. Push to GitHub
git push -u origin main
```

Whenever you make future enhancements or changes, update your repo in 3 simple commands:
```bash
git add .
git commit -m "Describe your update here"
git push
```

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build optimized production bundle
npm run build
```
Build files will be generated in `/dist` directory.

### Deploying to Firebase Hosting (Recommended & Free)
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Google
firebase login

# Initialize hosting
firebase init hosting
# -> Select 'dist' as your public directory
# -> Configure as a single-page app: Yes

# Deploy
firebase deploy
```

---

## 🛡️ Security Rules & Data Privacy
* Database rules are defined in `firestore.rules` and enforce Attribute-Based Access Control (ABAC).
* Only verified team members with approved email credentials can view or modify proprietary business data.
* Catch-all default deny rule prevents unauthorized public scraping.
