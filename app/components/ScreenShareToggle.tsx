import { useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import * as React from 'react';
import styles from './ScreenShareToggle.module.css';

export interface ScreenShareToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  children?: React.ReactNode;
  showIcon?: boolean;
  onChange?: (enabled: boolean) => void;
  withAudio?: boolean;
}

/**
 * The ScreenShareToggle component allows toggling screen sharing with the option to share audio.
 * This extends the default TrackToggle functionality to support browser audio sharing.
 */
export function ScreenShareToggle({
  children,
  showIcon = true,
  onChange,
  disabled,
  withAudio = false,
  ...props
}: ScreenShareToggleProps) {
  const [audioEnabled, setAudioEnabled] = React.useState(withAudio);
  const { localParticipant } = useLocalParticipant();
  
  // Track if screen share is currently active
  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);
  
  // Check if screen share is enabled when the component mounts
  React.useEffect(() => {
    if (localParticipant) {
      const screenShareTrack = Array.from(localParticipant.trackPublications.values()).find(
        (track) => track.source === Track.Source.ScreenShare
      );
      setIsScreenShareEnabled(!!screenShareTrack);
      
      // Update state when tracks change
      const handleTrackPublished = () => {
        const hasScreenShare = Array.from(localParticipant.trackPublications.values()).some(
          (track) => track.source === Track.Source.ScreenShare
        );
        setIsScreenShareEnabled(hasScreenShare);
      };
      
      const handleTrackUnpublished = () => {
        const hasScreenShare = Array.from(localParticipant.trackPublications.values()).some(
          (track) => track.source === Track.Source.ScreenShare
        );
        setIsScreenShareEnabled(hasScreenShare);
      };
      
      localParticipant.on('trackPublished', handleTrackPublished);
      localParticipant.on('trackUnpublished', handleTrackUnpublished);
      
      return () => {
        localParticipant.off('trackPublished', handleTrackPublished);
        localParticipant.off('trackUnpublished', handleTrackUnpublished);
      };
    }
  }, [localParticipant]);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioEnabled(e.target.checked);
  };

  const handleClick = async () => {
    if (!localParticipant) return;
    
    try {
      if (isScreenShareEnabled) {
        // If already sharing, unpublish screen share tracks
        await localParticipant.setScreenShareEnabled(false);
        if (onChange) onChange(false);
      } else {
        // If not sharing, use createScreenTracks with audio option
        const tracks = await localParticipant.createScreenTracks({
          audio: audioEnabled,
        });
        
        // Publish each track
        if (tracks && tracks.length > 0) {
          tracks.forEach((track) => {
            localParticipant.publishTrack(track);
          });
          if (onChange) onChange(true);
        }
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  const screenShareIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M0 4s0-2 2-2h12s2 0 2 2v8s0 2-2 2h-4c0 .667.083 1.167.25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75c.167-.333.25-.833.25-1.5H2s-2 0-2-2V4zm1.398-.855a.758.758 0 0 0-.254.302A1.46 1.46 0 0 0 1 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 0 0 .254-.302 1.464 1.464 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 0 0-.302-.254A1.46 1.46 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145z"/>
    </svg>
  );

  return (
    <div className={styles['lk-screen-share-toggle']}>
      <button
        className={`lk-button ${isScreenShareEnabled ? 'lk-button-active' : ''}`}
        onClick={handleClick}
        aria-pressed={isScreenShareEnabled}
        disabled={disabled}
        title="Share Screen"
        type="button"
        {...props}
      >
        {showIcon && screenShareIcon}
        {children}
      </button>
      {!isScreenShareEnabled && (
        <div className={styles['lk-screen-share-options']}>
          <label className={styles['lk-checkbox']}>
            <input
              type="checkbox"
              checked={audioEnabled}
              onChange={handleAudioChange}
              className={styles['lk-checkbox-input']}
            />
            <span className={styles['lk-checkbox-label']}>Share browser audio</span>
          </label>
        </div>
      )}
    </div>
  );
} 