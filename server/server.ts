import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parse';
import path from 'path';
import http from 'http'
import WebSocket, { WebSocketServer } from 'ws'
import session from 'express-session'

import MongoStore from 'connect-mongo'
import { createChannel } from './controllers/createChannel';
import { randomUUID } from 'crypto';

require('dotenv/config.js');

const mongoose = require('mongoose')

//set public folder
const dir = path.join(__dirname, '..', 'out');

//get Port value
const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app);

app.use(cookieParser());

app.use(express.static(dir));

app.use(express.urlencoded({ extended: true }))

app.use(express.json());

app.use(session({
    name: 'Boardgame',
    secret: 'boardIt',
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 1 * 24 * 60 * 60,
        dbName: process.env.DB_NAME
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 86400000,
    }
}));

app.use(cors(
    {
        origin: true,
        credentials: true
    }
));

//define route for every other get requests not related to /api path
app.get("/*", function (req, res) {
    const indexPagePath = path.join(__dirname, '..', 'out', 'index.html');

    res.sendFile(indexPagePath);
});


const websocketServer = new WebSocketServer({ server, path: '/wss' });

type ChannelType = {
    [key: string]: {
        channelName: string,
        members: { id: string, ws: WebSocket }[]
    }
}
//Multiple channels can be created for users to join.
const channels: ChannelType = {};

const channelExisits = ({ channelId, channels }: { channelId: string, channels: ChannelType }) => {
    return Boolean(channels[channelId])
}

websocketServer.on('connection', (ws, req) => {
    ws.on('error', (err) => {
        console.log('error in websocket', err);
    });

    ws.on('message', async (message: { type: string, payload: { [key: string]: any } }) => {
        /* Message is JSON. A message can be categorized by its "type" key. A message can be:
        createChannel<channelName>: Wants to create a channel.
        joinChannel<channelId>: Wants to join a channel.
        deleteChannel<channelId>: Wants to delete a channel.
        leaveChannel<channelId>: Wants to leave a channel.
        channelMessage<channelId,message>: Wants to send a message to members of a channel.
        */

        const type = message.type

        switch (type) {
            case 'createChannel':
                //The creator is the first member of the channel
                const { channelName } = message.payload;

                let channelId: string = randomUUID();

                channels[channelId] = { channelName, members: [{ id: req?.session?.id, ws }] }

                ws.send(JSON.stringify({ data: channelId }));

                break;
            case 'joinChannel':
                channelId = message.payload?.channelId;

                //Channel must exist
                if (!channelExisits({ channelId, channels })) {
                    ws.send(JSON.stringify({ data: { success: false, reason: 'Channel does not exist' } }));

                    break;
                }

                channels[channelId] = {
                    ...channels[channelId],
                    members: [...channels[channelId].members, { id: req?.session?.id, ws }]
                }

                ws.send(JSON.stringify({ data: true }));

                break;
            case 'deleteChannel':
                channelId = message.payload?.channelId;

                //Channel must exist
                if (!channelExisits({ channelId, channels })) {
                    ws.send(JSON.stringify({ data: { success: false, reason: 'Channel does not exist' } }));

                    break;
                }

                //The user must be a member of the channel
                if (!channels[channelId].members.find(i => i.id === req?.session?.id)) {
                    ws.send(JSON.stringify({ data: { success: false, reason: 'You are not a member' } }));

                    break;
                }

                delete channels[channelId];

                ws.send(JSON.stringify({ data: true }));

                break;
            case 'leaveChannel':
                channelId = message.payload?.channelId;

                //Channel must exist
                if (!channelExisits({ channelId, channels })) {
                    ws.send(JSON.stringify({ data: { success: false, reason: 'Channel does not exist' } }));

                    break;
                }

                //User must be a member of the channel
                if (!channels[channelId].members.find(i => i.id === req?.session?.id)) {
                    ws.send(JSON.stringify({ data: { success: false, reason: 'You are not a member' } }));

                    break;
                }

                channels[channelId]['members'] = channels[channelId].members.filter(i => i.id !== req?.session?.id);

                ws.send(JSON.stringify({ data: true }));

                break;
            case 'channelMessage':
                channelId = message.payload?.channelId;

                //Channel must exist
                if (!channelExisits({ channelId, channels })) {
                    ws.send(JSON.stringify({ data: { success: false, reason: 'Channel does not exist' } }));

                    break;
                }

                //User must be a member of the channel
                if (!channels[channelId].members.find(i => i.id === req?.session?.id)) {
                    ws.send(JSON.stringify({ data: { success: false, reason: 'You are not a member' } }));

                    break;
                }

                const messageValue = message.payload?.message

                channels[channelId].members.forEach(({ id, ws: socket }, index) => {
                    if (socket !== ws) {
                        socket.send(JSON.stringify({ data: { message: messageValue, channelId } }));
                    }
                })
        }

    })

    ws.on('close', () => {
        console.log('Client disconnected');
    });
})

//launch app and listen
server.listen(PORT, () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('connected')
        }
        else {
            console.log('connecting to db')
            const dbName = process.env.DB_NAME;

            const URI = (process.env.NODE_ENV === 'production') ? process.env.MONGO_URI : process.env.MONGO_LOCAL_URI

            mongoose.connect(URI, { dbName }).then((res: any) => console.log('connected'), (err: any) => console.log(err))
            console.log("Server launched on port " + PORT);
        }
    } catch (error) {
        console.log("ERROR launching server", error);
    }
});