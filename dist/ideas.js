"use strict";
// data structure
let obj = {
    _id: "OIDxxxxx",
    prop1: { _id: "OIDxxxxx.1" }
};
let idxs = {
    id: {
        OIDxxxx1: { _id: "OIDxxxx1", _type: "type", typeName: "Node", ins: { _id: "OIDxxxx2" } }
    }
};
//*************************
//let vType
let HueGW_Type = {
    _id: "xxx",
    _type: "type",
    _typeName: "HueGW",
    ins: {
        IP: {
            _type: "string",
            default: "192.168.1.123",
            min: 0,
            max: 100,
            description: "..."
        }
    },
    outs: {
        Alive: {
            _type: "number",
            description: "Timestamp..."
        }
    }
};
let HueGW = {
    _id: "xxx",
    _type: "HueGW",
    ins: { IP: { _vid: "xxxx1" } },
    outs: { Alive: { _vid: "xxxx2" } }
};
let vString_type = {
    _type: "type",
    typeName: "vString",
    text: { en: { name: "variable", description: "..." } }
};
let variable = {
    _id: "vid:xxx",
    _type: "vString",
    v: "192.168.1.100",
    wts: "874283765",
    rts: "874283764"
};
