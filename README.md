
# dexFreight Workshops

[dexFreight](https://www.dexfreight.io/) is a decentralized platform for the logistics industry. It provides stakeholders with an end-to-end solution to book, contract, move loads locally and globally within a community-owned marketplace powered by an ecosystem of open source protocols using smart contracts, blockchain technology, and machine learning.

## Workshop

### Pre-requisites:
You must have installed the following tools:

 - npm
 - node.js
 - git
 - Metamask (Google Chrome)

### Installation Steps:

To get started follow the next steps :

First, clone the working repo:
```batch
git clone https://github.com/dexfreightdev/workshops.git
cd workshops
```
Then install the dependencies:
```batch
npm install
```
Then run the software:
```batch
npm start
```

### Writing our contract

Let's open the online IDE Remix and create a new empty file

[https://remix.ethereum.org/](https://remix.ethereum.org/)

#### Our contract structure
Let's start with our pragma statement

```c++
pragma solidity ^0.5.1;
```
And create our base contract
```c++
pragma solidity ^0.5.1;

contract dexfreightTrackingSimulation {
	// Our code will be here
}
```

For this project, we will use 2 structures, one for storing Shipments and another for storing Tracking Events

```go
pragma solidity ^0.5.1;

contract dexfreightTrackingSimulation {
	struct Shipment {
       string originLat; // Origin Latitude
       string originLng; // Origin Longitude
       string destinationLat; // Destination Latitude
       string destinationLng; // Destination Longitude
       uint start; // Shipment Tracking Starting Time
       uint end; // Shipment Tracking End Time
       uint cost; // Shipment Price $$
       address payable carrier; // Carrier's receiver address $$
   }

   struct Event {
       uint shipmentId; // Which shipment is related to this event?
       uint progress; // In Which % of the progress was this shipment emitted
       uint time; // When was it emitted?
       string lat; // Coords
       string lng; // ...
       string eventName; // "Start" | "End"
   }
	
	
}
```

Now, let's define the variables where this data will be stored:
```go
contract dexfreightTrackingSimulation {

   struct Shipment {
       string originLat;
       string originLng;
       string destinationLat;
       string destinationLng;
       uint start;
       uint end;
       uint cost;
       address payable carrier;
   }

   struct Event {
       uint shipmentId;
       uint progress;
       uint time;
       string lat;
       string lng;
       string eventName;
   }
   
   mapping (uint => Shipment) public shipment; // Shipments
   mapping  (uint => Event[]) public events; // Events
}
```

Let's create the following methods:

 - createShipment (public): Create and stores a new shipment
 - completeShipment (private): Finalize a transaction and gives stored money to the user
 - notifyLocation (public):  Notifies a location and executes completeShipment if progress is 100%

```go
pragma solidity ^0.5.1;

contract dexfreightTrackingSimulation {

   struct Shipment {
       string originLat;
       string originLng;
       string destinationLat;
       string destinationLng;
       uint start;
       uint end;
       uint cost;
       address payable carrier;
   }

   struct Event {
       uint shipmentId;
       uint progress;
       uint time;
       string lat;
       string lng;
       string eventName;
   }
   mapping (uint => Shipment) public shipment;
   mapping  (uint => Event[]) public events;

   function createShipment(uint id , string memory originLat, string memory originLng,  string memory destinationLat, string memory destinationLng,
       uint start, uint end, uint cost, address payable carrier) public payable{
           require(msg.value == cost);
           shipment[id] = Shipment ( originLat, originLng, destinationLat, destinationLng, start,end,cost, carrier);
   }

   function completeShipment (uint id, uint time) private {
       Shipment memory ship = shipment[id];
       address payable carrier = ship.carrier;
       ship.end = time;
       carrier.transfer(ship.cost);
   }
   
   function notifyLocation (uint id, uint progress, uint time, string memory name, string memory lat, string memory lng) public {
        events[id].push(Event(id, progress, time, lat, lng, name));
        
        if(progress == 100)
            completeShipment(id, time);
   }
}
```
 
### Setting up the contract address

Then, we need to deploy with Remix IDE and setup our contract in the dexfreight app

let's go to our Workshop folder and edit the `ms-config.yml` file and put your deployed contract address

```yml
port: 5555
main: index.js
env:
	CONTRACT_ADDRESS: "YOUR_CONTRACT_ADDRESS"
```

NOW RESTART THE BACKEND STOPPING AND RUNNING `yarn start` AGAIN

Go to [https://observablehq.com/@dexfreightteam/dexfreight-tracking-simulation](https://observablehq.com/@dexfreightteam/dexfreight-tracking-simulation) and put the contract address in the main field

Enjoy!

## We are hiring!

  
  

Want to be part of our talented team? Please send your cv to adrian@dexfreight.io