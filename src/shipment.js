const Shipments = [];
let UpdateWatcher, CreateWatcher;
const config = require('../blockchain.json');
const TimeScale = 60 * 60;
const { CustomClient } = require('unete-eth/client');
const Contract = CustomClient(process.env.CONTRACT_ADDRESS, config.abi, {
    passphrase: config.passphrase,
    address: config.address,
    provider: config.provider,
    gasPrice: "20000000000"
});

const time = {
    start: Date.now(),
    scale: TimeScale
}


const Methods = module.exports = {

    time: () => time,

    async createShipment ({ stages, price, carrier }) {

        const ship = {
            stages,
            iid: Shipments.length,
            speed: Math.random()/300,
            start: Date.now(),
            price, carrier,
            position: 0,
            events: [],
            last_emit: 0
        };

        Shipments.push(ship);

        await emitShipmentCreate(ship);

        const interval = setInterval(async () => {
            ship.position += ship.speed;
            
            if(ship.position >= 1) {
                clearInterval(interval);
                await Methods.notifyLocation(ship.iid, 1, ship.stages[1].lat, ship.stages[1].lng);

                ship.position = 1;
                ship.end = Date.now();
                emitShipmentUpdate(ship);
                return;
            }
            emitShipmentUpdate(ship);
        }, 100);

        return ship;
    },

    async notifyLocation (iid, progress, lat, lng) {
        const time = $time(Date.now());

        Shipments[iid] = Shipments[iid] || { events: [], last_emit: 0 };
        progress = Math.floor(progress * 100);

        if(progress === 0) {
            Shipments[iid].events.push({
                time,
                iid, progress, lat, lng,
                eventName: "Start",
                hash: await Contract.notifyLocation(iid, progress, Date.now(), "Start", lat.toString(), lng.toString())
            });
        } else if(progress === 100) {
            Shipments[iid].events.push({
                time,
                iid, progress, lat, lng,
                eventName: "End",
                hash: await Contract.notifyLocation(iid, progress, Date.now(), "End", lat.toString(), lng.toString())
            });
        }

        return Shipments[iid].events = Shipments[iid].events.sort((a, b) => a.time - b.time);
    },

    async events (iid) {
        return Shipments[iid].events;
    },

    onUpdate(cb) {
        UpdateWatcher = cb;
    },

    onCreate (cb) {
        CreateWatcher = cb;
    },

    shipments: () => Shipments,
    next_id: () => Shipments.length

}

async function emitShipmentUpdate (ship) {
    try {
        UpdateWatcher(ship);
    } catch (exc) {
        console.log({ exc });
    }
}

async function emitShipmentCreate (shipment) {
    await Methods.notifyLocation(shipment.iid, 0, shipment.stages[0].lat, shipment.stages[0].lng);
    
    try {
        CreateWatcher(shipment);
    } catch (exc) {
        console.log({ exc });
    }
}

const $time = (x) => new Date(time.start + (x - time.start) * time.scale)