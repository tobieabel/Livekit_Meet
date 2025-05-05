import { Track, Participant } from 'livekit-client';
import * as React from 'react';
import {
  MediaDeviceMenu,
  DisconnectButton,
  TrackToggle,
  ChatIcon,
  GearIcon,
  LeaveIcon,
  ChatToggle,
  useLocalParticipantPermissions,
  usePersistentUserChoices,
  useMaybeLayoutContext,
  useRoomContext,
} from '@livekit/components-react';
import { supportsScreenSharing } from '@livekit/components-core';
import styles from './CustomControlBar.module.css';

/** @public */
export interface CustomControlBarControls {
  microphone?: boolean;
  camera?: boolean;
  screenShare?: boolean;
  leave?: boolean;
  chat?: boolean;
  inviteAgent?: boolean;
}

/** @public */
export interface CustomControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  variation?: 'minimal' | 'verbose' | 'textOnly';
  controls?: CustomControlBarControls;
}

/**
 * The `CustomControlBar` prefab component gives the user the basic user interface
 * to control their media devices (camera, microphone and screen share), open the `Chat` and leave the room.
 *
 * @remarks
 * This component is build with other LiveKit components like `TrackToggle`,
 * `DeviceSelectorButton`, `DisconnectButton` and `StartAudio`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <CustomControlBar />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function CustomControlBar({ variation, controls, ...props }: CustomControlBarProps) {
  const permissions = useLocalParticipantPermissions();
  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices();
  const layoutContext = useMaybeLayoutContext();
  const [inviting, setInviting] = React.useState(false);
  const [hasAgent, setHasAgent] = React.useState(false);
  const room = useRoomContext();

  // Track agent presence
  React.useEffect(() => {
    if (!room) {
      console.log('No room available');
      setHasAgent(false);
      return;
    }

    const checkForAgent = () => {
      const participants = Array.from(room.remoteParticipants.values());
      console.log('Current participants:', participants);
      
      const agentFound = participants.some((participant: Participant) => {
        const isAgent = participant.identity.startsWith('agent-');
        console.log('Checking participant:', participant.identity, 'is agent:', isAgent);
        return isAgent;
      });
      
      console.log('Agent found:', agentFound);
      setHasAgent(agentFound);
    };

    // Check initially
    checkForAgent();

    // Set up listeners for participant changes
    room.on('participantConnected', checkForAgent);
    room.on('participantDisconnected', checkForAgent);

    return () => {
      room.off('participantConnected', checkForAgent);
      room.off('participantDisconnected', checkForAgent);
    };
  }, [room]);

  if (!permissions) {
    return null;
  }

  const showIcon = !variation || variation === 'minimal';
  const showText = variation === 'verbose' || variation === 'textOnly';

  const defaultControls = {
    microphone: permissions.canPublish,
    camera: permissions.canPublish,
    screenShare: permissions.canPublish && supportsScreenSharing(),
    leave: true,
    chat: true,
    inviteAgent: true,
  };

  const controlBarControls = { ...defaultControls, ...controls };

  // Handler for inviting agent
  const handleInviteAgent = async () => {
    setInviting(true);
    try {
      if (!room) {
        throw new Error('No room context available');
      }

      const roomName = room.name;
      const agentName = 'computer';
      const metadata = JSON.stringify({ invitedBy: 'user' });

      const response = await fetch('/api/agent-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, agentName, metadata }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert('Agent invited successfully!');
    } catch (error) {
      if (error instanceof Error) {
        alert('Failed to invite agent: ' + error.message);
      } else {
        alert('Failed to invite agent: Unknown error occurred');
      }
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="lk-control-bar" {...props}>
      <div className="lk-control-bar-left">
        {controlBarControls.microphone && (
          <div className="lk-button-group">
            <TrackToggle source={Track.Source.Microphone}>
              <span>Microphone</span>
            </TrackToggle>
            <div className="lk-button-group-menu">
              <MediaDeviceMenu kind="audioinput" />
            </div>
          </div>
        )}
        {controlBarControls.camera && (
          <div className="lk-button-group">
            <TrackToggle source={Track.Source.Camera}>
              <span>Camera</span>
            </TrackToggle>
            <div className="lk-button-group-menu">
              <MediaDeviceMenu kind="videoinput" />
            </div>
          </div>
        )}
        {controlBarControls.screenShare && (
          <TrackToggle source={Track.Source.ScreenShare}>
            <span>Share Screen</span>
          </TrackToggle>
        )}
      </div>
      <div className={styles['lk-control-bar-right']}>
        {controlBarControls.chat && (
          <ChatToggle>
            <ChatIcon />
            <span>Chat</span>
          </ChatToggle>
        )}
        {controlBarControls.inviteAgent && (
          <button 
            onClick={handleInviteAgent} 
            disabled={inviting || hasAgent}
            className="lk-button"
            title={hasAgent ? "An agent is already in the room" : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
              <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="currentColor"/>
              <path d="M12 16C9.33 16 4 17.34 4 20V22H20V20C20 17.34 14.67 16 12 16ZM6 20C6.2 19.29 9.3 18 12 18C14.7 18 17.8 19.29 18 20H6Z" fill="currentColor"/>
            </svg>
            <span>{inviting ? 'Inviting...' : hasAgent ? 'Agent Present' : 'Invite Agent'}</span>
          </button>
        )}
        {controlBarControls.leave && (
          <DisconnectButton>
            <LeaveIcon />
            <span>Leave</span>
          </DisconnectButton>
        )}
      </div>
    </div>
  );
} 