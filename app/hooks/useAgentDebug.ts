import { useRoomContext } from '@livekit/components-react';
import { useEffect } from 'react';
import { RemoteParticipant } from 'livekit-client';

export function useAgentDebug() {
  const room = useRoomContext();
  
  useEffect(() => {
    if (!room) return;
    
    // Log all participants when the room changes
    const logParticipants = () => {
      console.log('Room participants:', 
        Array.from(room.remoteParticipants.values()).map((p: RemoteParticipant) => ({
          identity: p.identity,
          name: p.name,
          isAgent: p.isAgent,
          metadata: p.metadata
        }))
      );
    };
    
    // Log initial participants
    logParticipants();
    
    // Set up event listeners
    const handleParticipantConnected = () => {
      console.log('Participant connected event fired');
      logParticipants();
    };
    
    const handleParticipantDisconnected = () => {
      console.log('Participant disconnected event fired');
      logParticipants();
    };
    
    room.on('participantConnected', handleParticipantConnected);
    room.on('participantDisconnected', handleParticipantDisconnected);
    
    return () => {
      room.off('participantConnected', handleParticipantConnected);
      room.off('participantDisconnected', handleParticipantDisconnected);
    };
  }, [room]);
} 