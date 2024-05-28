# ARI - Core
ARI is the "Working title"! 😀

Realtime database/broker 

## Client API


### Type definitions


### Objects
For object structure / meta data - fairly static...

```
// Initialization
let ariPlugin = Ari.CreatePlugin("TestPlugin")
let ctx = ariPlugin.CreateContext("TestContext")
```

```
// Usage example
ari.oPub(".", value: object): void
ari.oSub
oUnSub
oExists
```

### Values
For fast changing datapoints...

Examples:
``` 
ari.vPub(vId: string, value: object): void
ari.vSub
vUnsub
vExists
```


### Calls

```
```


### Streams?

```
```

### Files?

```
```


