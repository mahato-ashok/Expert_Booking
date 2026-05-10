import { useEffect } from 'react'
import { useSocket } from '../context/SocketContext.jsx'

/**
 * Joins an expert's socket room and calls onSlotBooked({ date, timeSlot })
 * whenever another user books a slot for this expert.
 */
export function useExpertSocket(expertId, onSlotBooked) {
  const socketRef = useSocket()

  useEffect(() => {
    if (!expertId || !socketRef?.current) return

    const socket = socketRef.current

    socket.emit('join-expert', expertId)

    socket.on('slot-booked', onSlotBooked)

    return () => {
      socket.emit('leave-expert', expertId)
      socket.off('slot-booked', onSlotBooked)
    }
  }, [expertId, onSlotBooked, socketRef])
}
