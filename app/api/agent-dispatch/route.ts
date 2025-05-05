import { NextRequest, NextResponse } from 'next/server';
import { AgentDispatchClient } from 'livekit-server-sdk';

// Helper function to validate environment variables
function validateEnvVars() {
  const url = process.env.LIVEKIT_URL;
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;

  if (!url || !key || !secret) {
    throw new Error('Missing required environment variables: LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET');
  }

  return { url, key, secret };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body of the request
    const { roomName, agentName, metadata } = await request.json();

    // Validate required fields
    if (!roomName || !agentName) {
      return new NextResponse('Missing roomName or agentName', { status: 400 });
    }

    // Get and validate environment variables
    const { url, key, secret } = validateEnvVars();

    // Create the AgentDispatchClient using environment variables
    const client = new AgentDispatchClient(url, key, secret);

    // Create the dispatch
    const dispatch = await client.createDispatch(roomName, agentName, { metadata });

    // Return the dispatch result as JSON
    return NextResponse.json({ dispatch });
  } catch (error) {
    console.error('Agent dispatch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Add GET endpoint to list dispatches
export async function GET(request: NextRequest) {
  try {
    const roomName = request.nextUrl.searchParams.get('roomName');
    
    if (!roomName) {
      return new NextResponse('Missing roomName parameter', { status: 400 });
    }

    // Get and validate environment variables
    const { url, key, secret } = validateEnvVars();

    const client = new AgentDispatchClient(url, key, secret);

    const dispatches = await client.listDispatch(roomName);
    return NextResponse.json({ dispatches });
  } catch (error) {
    console.error('List dispatches error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 