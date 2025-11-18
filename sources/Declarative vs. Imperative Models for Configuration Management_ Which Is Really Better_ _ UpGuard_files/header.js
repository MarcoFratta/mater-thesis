;(() => {
    window.upg = {
        // localStorage wrapper gets and sets JSON serialisable javascript plain objects/arrays to local storage
        storage: {
            get: (key, defaultVal) => {
                try {
                    const val = localStorage.getItem(key)
                    if (!val) return defaultVal
                    return JSON.parse(val)
                } catch (err) {
                    return null
                }
            },
            set: (key, val) => {
                try {
                    localStorage.setItem(key, JSON.stringify(val))
                } catch (err) {
                    return null
                }
            }
        },
        // Reactivity
        signals: {
            _store: {},
            subscribe: (key, cb) => {
                if (!window.upg.signals._store[key]) {
                    window.upg.signals._store[key] = {
                        val: undefined,
                        cbs: [cb]
                    }
                } else {
                    window.upg.signals._store[key].cbs.push(cb)
                    cb(window.upg.signals._store[key].val)
                }
            },
            // unsubscribe: (key, cb) => {},
            update: (key, val) => {
                if (!window.upg.signals._store[key]) {
                    window.upg.signals._store[key] = { 
                        val: val || undefined,
                        cbs: []
                    }
                } else {
                    window.upg.signals._store[key].val = val || undefined
                    window.upg.signals._store[key].cbs.forEach(cb => { 
                        cb(val)
                     })
                }
            }
        },
    }
})()
