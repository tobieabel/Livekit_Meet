<a href="https://livekit.io/">
  <img src="./.github/assets/livekit-mark.png" alt="LiveKit logo" width="100" height="100">
</a>

# LiveKit Meet

<p>
  <a href="https://meet.livekit.io"><strong>Try the demo</strong></a>
  •
  <a href="https://github.com/livekit/components-js">LiveKit Components</a>
  •
  <a href="https://docs.livekit.io/">LiveKit Docs</a>
  •
  <a href="https://livekit.io/cloud">LiveKit Cloud</a>
  •
  <a href="https://blog.livekit.io/">Blog</a>
</p>

<br>

LiveKit Meet is an open source video conferencing app built on [LiveKit Components](https://github.com/livekit/components-js), [LiveKit Cloud](https://cloud.livekit.io/), and Next.js. It's been completely redesigned from the ground up using our new components library.

![LiveKit Meet screenshot](./.github/assets/livekit-meet.jpg)

## Tech Stack

- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
- App is built with [@livekit/components-react](https://github.com/livekit/components-js/) library.

## Demo

Give it a try at https://meet.livekit.io.

## Dev Setup

Steps to get a local dev setup up and running:

1. Run `pnpm install` to install all dependencies.
2. Copy `.env.example` in the project root and rename it to `.env.local`.
3. Update the missing environment variables in the newly created `.env.local` file.
4. Run `pnpm dev` to start the development server and visit [http://localhost:3000](http://localhost:3000) to see the result.
5. Start development 🎉

Summary of Changes 24th April 2025:
Introduced AgentVisualizerOverlay.tsx Component:
Created a new component specifically designed to overlay visual elements onto agent participant tiles.
Utilizes LiveKit hooks (useParticipants, useTracks) to identify participants marked as agents (p.isAgent) and locate their microphone audio tracks (Track.Source.Microphone).
Implements logic to dynamically find the corresponding DOM element for each agent's tile (.lk-participant-tile) by querying the DOM and matching the agent's identity within the participant name <span>.
Calculates the position (getBoundingClientRect) of the agent's tile during the render cycle.
Uses ReactDOM.createPortal to render a div containing a BarVisualizer and the agent's identity directly into document.body.
Applies absolute positioning CSS to the portal div based on the calculated tile coordinates, effectively layering the visualizer onto the agent's tile.
Refined the useEffect logic to prevent infinite render loops by separating state updates from DOM measurements. State now primarily stores identified agents and their tracks, while DOM querying and positioning occur during render.
Added styling to control the size (height) and placement (transform) of the visualizer overlay at the bottom of the agent tile.
Integrated AgentVisualizerOverlay into AgentAwareVideoConference.tsx:
The AgentAwareVideoConference component now renders the <AgentVisualizerOverlay /> alongside the standard <VideoConference /> component, allowing the overlay to function without modifying the core video conference layout.
