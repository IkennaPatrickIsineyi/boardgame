import { randomUUID } from "crypto"
import WebSocket from "ws"

type Props = {
    channelName: string,
    members: { id: string, ws: WebSocket }[],
    allChannels: {
        [key: string]: {
            channelName: string,
            members: { id: string, ws: WebSocket }[]
        }
    }
}

export async function createChannel({ channelName, members, allChannels }: Props) {
    const channelId = randomUUID();

    const channels = { ...allChannels, [channelId]: { channelName, members } }
    return { success: true, channels }
} 