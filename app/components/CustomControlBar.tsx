import { Track } from 'livekit-client';
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
} from '@livekit/components-react';
import { supportsScreenSharing } from '@livekit/components-core';

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
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const permissions = useLocalParticipantPermissions();
  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices();
  const layoutContext = useMaybeLayoutContext();

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

  const handleChatClick = () => {
    setIsChatOpen(!isChatOpen);
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
      <div className="lk-control-bar-right">
        {controlBarControls.chat && (
          <ChatToggle onClick={handleChatClick}>
            <ChatIcon />
            <span>Chat</span>
          </ChatToggle>
        )}
        {controlBarControls.inviteAgent && (
          <button
            type="button"
            className="lk-button lk-invite-agent"
            onClick={() => {
              // TODO: Implement agent invitation logic
              console.log('Inviting agent...');
            }}
          >
            <span className="material-icons">person_add</span>
            <span>Invite Agent</span>
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