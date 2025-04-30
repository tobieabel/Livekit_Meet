import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const overlayContainerRef = useRef<HTMLDivElement>(null);

  const trackRefs = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { updateOnlyOn: [], onlySubscribed: false }
  );

  // Memoize the agent overlays to avoid unnecessary recalculations
  const agentOverlays = useMemo(() => {
    const agents = participants.filter((p) => p.isAgent);
    return agents.map((agent) => {
      const trackRef = trackRefs.find(
        (ref) => ref.participant.identity === agent.identity
      );
      return { participant: agent, trackRef };
    });
  }, [
    participants.map(p => p.identity).join(','),
    trackRefs.map(t => `${t.participant.identity}:${t.publication?.trackSid ?? ''}`).join(',')
  ]);

  // Calculate DOM positions during render
  const validOverlays = agentOverlays.map(({ participant, trackRef }) => {
    const allTileElements = Array.from(document.querySelectorAll<HTMLElement>('.lk-participant-tile'));
    const foundTileElement = allTileElements.find((tileElement) => {
      const nameElement = tileElement.querySelector<HTMLSpanElement>('span.lk-participant-name');
      return nameElement?.textContent?.trim() === participant.identity;
    }) || null;
    const rect = foundTileElement?.getBoundingClientRect() ?? null;
    return { participant, trackRef, rect };
  }).filter(o => o.rect && o.trackRef);

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