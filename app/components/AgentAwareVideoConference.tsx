import { VideoConference, VideoConferenceProps } from '@livekit/components-react';
import { useAgentDebug } from '../hooks/useAgentDebug';
import { AgentVisualizerOverlay } from './AgentVisualizerOverlay';

export function AgentAwareVideoConference(props: VideoConferenceProps) {
  // Use our debug hook (optional, can be removed if not needed anymore)
  useAgentDebug();

  console.log('AgentAwareVideoConference rendered with props:', props);

  return (
    // Use a relative positioning context for the overlay if needed
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <VideoConference {...props} />
      {/* Render the overlay component *after* VideoConference */}
      <AgentVisualizerOverlay />
    </div>
  );
} 