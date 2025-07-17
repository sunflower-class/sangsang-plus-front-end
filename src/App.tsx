import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { VITE_API_URL } from './env/env'

function App() {
  const [count, setCount] = useState(0)

  const handleSpringBootApiClick = async () => {
    const res = await fetch(VITE_API_URL + '/demo/message?message=Hello', { method: 'GET' })
    console.log('Response:', res)
  }
  const handlePythonApiClick = async () => {
    const res = await fetch(VITE_API_URL + '/python/message', { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Hello from React' })
    })
    const data = await res.json()
    console.log('result:', data)
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={handleSpringBootApiClick}>
          spring boot api call
        </button>
        <button onClick={handlePythonApiClick}>
          python api call
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
