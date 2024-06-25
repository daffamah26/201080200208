import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys' //tambahan
import { Boom } from '@hapi/boom'

async function connectToWhatsApp () {
    const {state, saveCreds} = await useMultiFileAuthState('auth') //tambahan
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state //tambahan
    })
    sock.ev.on('creds.update', saveCreds) //tambahan 
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out //tambahan "?" untuk lastdisconnect
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', async m => { //tambahan async
        console.log(JSON.stringify(m, undefined, 2))

        console.log('replying to', m.messages[0].key.remoteJid)
        await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
    })
}
// run in main file
connectToWhatsApp()