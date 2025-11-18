;(() => {
    const map = {
        "@modules": "https://assets.upguard.com/wf/modules",
    }

    /** @type { HTMLElement[] } */
    const $$els = Array.from(document.querySelectorAll('[data-import]')) 

    $$els.forEach($el => {
        // Get js module URL and replace map values, eg "@modules/example.js" to "https://assets.upguard.com/wf/modules/example.js"
        let url = $el.dataset.import
        Object.keys(map).sort((a, b) => b.length - a.length).forEach(key => {
            url = url.split(key).join(map[key])
        })

        // @todo defer loading if [data-loading] attribute is set. Perhaps support "lazy" with a "within one vh" hueristic.

        try {
            import(url).then(mod => {
                mod.default($el) // Assumes a default function is exported that expects a single HTMLElement as the argument
            })
        } catch (error) {
            console.error(error)
        }
    })
})()
