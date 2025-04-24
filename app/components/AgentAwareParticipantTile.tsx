import { ParticipantTile, useParticipantContext, BarVisualizer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useTracks } from '@livekit/components-react';
import styles from './AgentAwareParticipantTile.module.css';
import { useEffect, useState } from 'react';

export function AgentAwareParticipantTile() {
  const participant = useParticipantContext();
  const [isAgent, setIsAgent] = useState(false);
  
  // Debug logging
  console.log('AgentAwareParticipantTile rendered for participant:', {
    identity: participant.identity,
    name: participant.name,
    isAgent: participant.isAgent,
    metadata: participant.metadata
  });

  // Check if participant is an agent
  useEffect(() => {
    setIsAgent(participant.isAgent);
    console.log('Agent check for participant:', participant.identity, {
      isAgent: participant.isAgent
    });
  }, [participant]);

  // Get audio tracks
  const audioTracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: true }],
    { onlySubscribed: false }
  );
  
  console.log('Audio tracks for participant:', participant.identity, {
    trackCount: audioTracks.length,
    tracks: audioTracks.map(track => ({
      sid: track.publication?.trackSid,
      kind: track.publication?.kind,
      isSubscribed: track.publication?.isSubscribed,
      source: track.source
    }))
  });

  // If participant is an agent, show BarVisualizer
  if (isAgent) {
    console.log('Participant is an agent, attempting to show BarVisualizer');
    
    // Find the audio track for the agent
    const audioTrack = audioTracks[0];
    
    console.log('Audio track for agent:', audioTrack ? {
      sid: audioTrack.publication?.trackSid,
      kind: audioTrack.publication?.kind,
      isSubscribed: audioTrack.publication?.isSubscribed,
      source: audioTrack.source
    } : 'No audio track found');
    
    return (
      <div className={styles['agent-visualizer']}>
        <ParticipantTile />
        {audioTrack && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <BarVisualizer trackRef={audioTrack} />
          </div>
        )}
      </div>
    );
  }

  console.log('Participant is not an agent, using default ParticipantTile');
  return <ParticipantTile />;
} 