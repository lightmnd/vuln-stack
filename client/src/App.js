import React, { useState } from 'react';

// import axios from 'axios';

function App() {

  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [comment, setComment] = useState('');
  const [data, setData] = useState('');
  const [error, setError] = useState('');

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

  function Comment({ comment }) {
    return <div dangerouslySetInnerHTML={{ __html: comment }} />;
  }

  return (
    <div>
      <h1>Vulnerable App</h1>
      <p>Test the SQL Injection and XSS vulnerabilities</p>

      <hr />
      <hr />

      <h2>Login (SQLi)</h2>
      <input onChange={e => setUser(e.target.value)} placeholder="Username" />
      <input onChange={e => setPass(e.target.value)} placeholder="Password" />
      <button onClick={login}>Login</button>

      <hr />
      <hr />

      <h2>XSS Comment</h2>
      <input onChange={e => setComment(e.target.value)} placeholder="Comment" />
      <iframe
        title="xss"
        src={`http://localhost:4000/comment?q=${encodeURIComponent(comment)}`}
      ></iframe>

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

    </div>
  );
}

export default App;
