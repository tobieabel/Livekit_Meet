import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  useParticipants,
  useTracks,
  BarVisualizer,
  TrackReferenceOrPlaceholder,
  type TrackReference,
} from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';

interface AgentOverlayInfo {
  participant: Participant;
  trackRef: TrackReferenceOrPlaceholder | undefined;
  rect: DOMRect | null;
  element: HTMLElement | null;
}

export function AgentVisualizerOverlay() {
  const participants = useParticipants();
  const [agentOverlays, setAgentOverlays] = useState<AgentOverlayInfo[]>([]);
  const overlayContainerRef = useRef<HTMLDivElement>(null);

  const trackRefs = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { updateOnlyOn: [], onlySubscribed: false }
  );
  
  const getAgentAudioTrack = (agentIdentity: string): TrackReferenceOrPlaceholder | undefined => {
    const track = trackRefs.find(
      (ref) => ref.participant.identity === agentIdentity
    );
    if (track) {
      console.log(`AgentVisualizerOverlay: Found audio trackRef for agent ${agentIdentity}:`, track)
    } else {
       console.log(`AgentVisualizerOverlay: Could NOT find audio trackRef for agent ${agentIdentity}`);
    }
    return track;
  };

  useEffect(() => {
    const agents = participants.filter((p) => p.isAgent);
    const newOverlays: AgentOverlayInfo[] = [];

    console.log(`AgentVisualizerOverlay: Found ${agents.length} agent(s)`);

    const allTileElements = document.querySelectorAll<HTMLElement>('.lk-participant-tile');
    console.log(`AgentVisualizerOverlay: Found ${allTileElements.length} tile elements with class .lk-participant-tile`);

    agents.forEach((agent) => {
      let foundTileElement: HTMLElement | null = null;

      allTileElements.forEach((tileElement) => {
        const nameElement = tileElement.querySelector<HTMLSpanElement>('span.lk-participant-name');
        
        if (nameElement?.textContent?.trim() === agent.identity) {
          foundTileElement = tileElement;
          console.log(`AgentVisualizerOverlay: Matched name span content for agent ${agent.identity} in tile:`, tileElement);
        }
      });


      if (foundTileElement) {
        const rect = (foundTileElement as HTMLElement).getBoundingClientRect();
        const trackRef = getAgentAudioTrack(agent.identity);
        newOverlays.push({ participant: agent, trackRef: trackRef, rect, element: foundTileElement });
        console.log(`AgentVisualizerOverlay: Found tile container for agent ${agent.identity} at`, rect);
      } else {
         console.log(`AgentVisualizerOverlay: Could not find matching tile container for agent ${agent.identity}`);
      }
    });

    setAgentOverlays(newOverlays);

    // TODO: Add ResizeObserver logic here

  }, [participants, trackRefs]);

  const validOverlays = agentOverlays.filter(o => o.rect && o.trackRef);

  console.log(`AgentVisualizerOverlay: Rendering ${validOverlays.length} valid overlays.`);

  return (
    <div ref={overlayContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
      {validOverlays.map(({ participant, trackRef, rect }) => {
        if (!rect || !trackRef) return null;

        const containerRect = overlayContainerRef.current?.getBoundingClientRect();
        
        const overlayHeight = 100;

        const style: React.CSSProperties = {
          position: 'absolute',
          top: rect.top - (containerRect?.top ?? 0),
          left: rect.left - (containerRect?.left ?? 0),
          width: rect.width,
          height: `${overlayHeight}px`,
          bottom: 'auto',
          transform: `translateY(${rect.height - overlayHeight}px)`,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          boxSizing: 'border-box',
          padding: '2px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        };

        console.log(`AgentVisualizerOverlay: Creating portal for agent ${participant.identity} with track ${trackRef.publication?.trackSid ?? 'placeholder/undefined'}`);

        return ReactDOM.createPortal(
          <div key={participant.sid} style={style}>
             <p style={{color: 'white', margin: 0, fontSize: '10px', textAlign: 'center'}}>Agent: {participant.identity}</p>
             <BarVisualizer trackRef={trackRef} style={{ flexGrow: 1}}/>
          </div>,
          document.body
        );
      })}
    </div>
  );
} 