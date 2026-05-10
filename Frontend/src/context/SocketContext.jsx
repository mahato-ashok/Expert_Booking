import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const socketRef = useRef(null)

useEffect(() => {
  socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    transports: ['polling', 'websocket'], 
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

    socketRef.current.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
