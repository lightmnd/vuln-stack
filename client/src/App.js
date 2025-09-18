/**
 * Vulnerable React Application
 * This application intentionally contains several security vulnerabilities
 * for educational purposes. DO NOT USE IN PRODUCTION.
 * 
 * Test Scenarios:
 * 1. SQL Injection:
 *    - Try: admin'--
 *    - Try: ' OR '1'='1
 * 
 * 2. XSS:
 *    - Input: <script>alert('XSS')</script>
 *    - Input: <img src=x onerror="alert(document.cookie)">
 * 
 * 3. IDOR:
 *    - Try accessing different user IDs: 1, 2, 3
 *    - Try accessing admin account
 */

import React, { useState, useRef } from 'react';

// import axios from 'axios';

function App() {

  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [comment, setComment] = useState('');
  const [data, setData] = useState('');
  const [error, setError] = useState('');

  // Add new state variables
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [configData, setConfigData] = useState(null);
  const fileInputRef = useRef(null);

  /**
   * Login Component
   * Vulnerable to:
   * - SQL Injection
   * - No input sanitization
   * - Clear text password transmission
   */
  const login = async () => {

    try {
      setError('');
      setData('');
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok && res.status !== 200) {
        setError('Login failed');
        return;
      }
      const data = await res.json()

      setData(data);

    } catch (err) {
      console.error(">>>", err);
      setError(err.message);
    }

    // await axios.post('http://localhost:4000/login', { username, password })
    //   .then(res => alert(res.data))
    //   .catch(err => alert("Error"));
  };

  // function Comment({ comment }) {
  //   return <div dangerouslySetInnerHTML={{ __html: comment }} />;
  // }

  return (
    <div className='app-container'>
      <h1>Vulnerable App</h1>
      <p>Test the SQL Injection and XSS vulnerabilities</p>

      <hr />
      <hr />

      <h2>Login (SQLi)</h2>
      <input onChange={e => setUser(e.target.value)} placeholder="Username" />
      <input onChange={e => setPass(e.target.value)} placeholder="Password" />
      <button onClick={login}>Login</button>
      {data && <div>User Data: {JSON.stringify(data)}</div>}

      <hr />
      <hr />

      <h2>XSS Comment</h2>

      <input onChange={e => setComment(e.target.value)} placeholder="Comment" />
      {/* /**
       * XSS Vulnerable Component
       * Demonstrates:
       * - Reflected XSS
       * - Dangerous innerHTML usage
       * - Unsanitized URL parametes
       */ }
      <iframe
        title="xss"
        src={`http://localhost:4000/comment?q=${encodeURIComponent(comment)}`}
      ></iframe>
       
       <a href="https://my-bank.example.com/welcome?user=<img src=x onerror=alert('hello!')>">Test</a>

      <hr />
      <hr />

      {/* Add another vulnerability */}
      <h2>SQLi Result</h2>
      <button onClick={() => setData('')}>Clear</button>
      <div>
        {data && <div>Data: {JSON.stringify(data)}</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>

      <hr />
      <hr />

      <h2>Insecure Direct Object Reference (IDOR)</h2>
      <p>Enter a user ID to fetch user details (simulates IDOR vulnerability):</p>
      <input
        placeholder="User ID"
        onChange={e => setUser(e.target.value)}
        value={username}
      />
      {/* /**
       * IDOR Vulnerable Component
       * Demonstrates:
       * - No access control
       * - Direct object reference
       * - Unauthorized data access
       */}
      <button
        onClick={async () => {
          setError('');
          setData('');
          try {
            const res = await fetch(`http://localhost:4000/user/${username}`);
            if (!res.ok) {
              setError('Failed to fetch user data');
              return;
            }
            const userData = await res.json();
            setData(userData);
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        Fetch User Data
      </button>
      <div>
        {data && <div>User Data: {JSON.stringify(data)}</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>

      <hr />
      <h2>Product Search (SQL Injection)</h2>
      <input
        placeholder="Search products..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <button onClick={async () => {
        try {
          const res = await fetch(`http://localhost:4000/search?term=${searchTerm}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (err) {
          setError(err.message);
        }
      }}>Search</button>
      {searchResults.length > 0 && (
        <div>Results: {JSON.stringify(searchResults)}</div>
      )}

      <hr />
      <h2>Password Reset (Cryptographic Failure)</h2>
      <input
        placeholder="Reset Token"
        value={resetToken}
        onChange={e => setResetToken(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />
      <button onClick={async () => {
        try {
          const res = await fetch('http://localhost:4000/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resetToken, newPassword })
          });
          if (!res.ok) throw new Error('Reset failed');
          alert('Password reset successful');
        } catch (err) {
          setError(err.message);
        }
      }}>Reset Password</button>

      <hr />
      <h2>System Information (Security Misconfiguration)</h2>
      <button onClick={async () => {
        try {
          const res = await fetch('http://localhost:4000/api/config');
          const data = await res.json();
          setConfigData(data);
        } catch (err) {
          setError(err.message);
        }
      }}>Show System Config</button>
      {configData && (
        <pre>{JSON.stringify(configData, null, 2)}</pre>
      )}

      <hr />
      <h2>Debug Information</h2>
      <button onClick={async () => {
        try {
          const res = await fetch('http://localhost:4000/debug');
          const data = await res.text();
          setData(data);
        } catch (err) {
          setError(err.message);
        }
      }}>Show Debug Info</button>

      <hr />
      <h2>Command Injection</h2>
      <input
        placeholder="Search files..."
        onChange={e => setSearchTerm(e.target.value)}
      />
      <button onClick={async () => {
        try {
          const res = await fetch(`http://localhost:4000/api/search?query=${searchTerm}`);
          const data = await res.text();
          setData(data);
        } catch (err) {
          setError(err.message);
        }
      }}>Search Files</button>

      <hr />
      <h2>Unrestricted File Upload</h2>
      <input
        type="file"
        ref={fileInputRef}
      />
      <button onClick={async () => {
        try {
          const file = fileInputRef.current.files[0];
          if (!file) {
            setError('Please select a file');
            return;
          }

          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch('http://localhost:4000/upload', {
            method: 'POST',
            body: formData
          });

          if (!res.ok) throw new Error('Upload failed');
          alert('File uploaded successfully');
        } catch (err) {
          setError(err.message);
        }
      }}>Upload File</button>

      {/* Error display */}
      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default App;
