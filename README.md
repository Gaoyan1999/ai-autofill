## **AI Auto-Fill Features**

- **One-Click Fill**
    - Users can fill out an entire web form with just one click, saving time on repetitive tasks.
    - Repeated actions like job applications, expense forms, or registrations only need to be set up once; the AI can auto-fill them multiple times.
- **Smart Context Recognition & Key Information Extraction**
    - Unlike Chrome Auto-Fill or other plugins that require manual field configuration, the AI understands the form and its context.
    
    **Use Cases:**
    
    1. **Job Applications**
        - Upload a resume once, and the AI automatically extracts key information like name, email, education, and work experience to fill different company application forms.
    2. **Course Enrollment / Exam Registration**
        - Upload personal info or educational background, and the AI automatically fills school, degree, course preferences, and exam details.
    3. **Health / Medical Forms**
        - Upload health records or questionnaires, and the AI auto-fills appointment or online consultation forms.
        - Example: For a hospital online registration system, the AI fills in name, date of birth, insurance number, and medical history automatically.
- **Local Deployment & Enhanced Data Security**
    - User data stays on the local machine; no need to upload to the cloud. Sensitive information remains protected.
- **Support for Multiple Form Types**
    - Works with text inputs, dropdowns, radio/checkboxes, and dynamic forms.
- **Multi-Account & Cross-Site Management**
    - Distinguishes between work and personal information, allowing one-click switching between different contexts.


# How to run
1. install package and build
```code
pnpm i
pnpm build
```

2. Then you will get a dist file in root directory

3. Click **Load unpacked** button in chrome://extensions, and upload the dist file


# TODO List
-  supporting the selects that are not semantic.
-  polish UI
    add loading state when ai is processing task