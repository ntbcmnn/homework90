import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';
import {IncomingMessage, Line} from './types';

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
app.use(router);

const connectedClients: WebSocket[] = [];

let lines: Line[] = [];

router.ws('/canvas', (ws, req) => {
    connectedClients.push(ws);
    console.log('Client connected. Total:', connectedClients.length);

    ws.send(JSON.stringify({type: 'INIT_CANVAS', payload: lines}));

    ws.on('message', (message) => {
        try {
            const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;

            if (decodedMessage.type === 'DRAW') {
                lines.push(...decodedMessage.payload);

                connectedClients.forEach((clientWs) => {
                    clientWs.send(JSON.stringify({type: 'INIT_CANVAS', payload: decodedMessage.payload}));
                });
            }
        } catch (e) {
            ws.send(JSON.stringify({error: 'Invalid format.'}));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const index = connectedClients.indexOf(ws);
        connectedClients.splice(index, 1);
        console.log('Client total: ' + connectedClients.length);
    });
});

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
