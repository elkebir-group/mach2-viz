class DefaultDict {
    constructor(defaultVal) {
        return new Proxy({}, {
        get: (target, name) => name in target ? target[name] : defaultVal
        })
    }
}

export default DefaultDict;