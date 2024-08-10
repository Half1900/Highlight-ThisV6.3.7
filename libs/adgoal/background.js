const universalSearchCredentials = {
    API_PUBLIC_KEY: '41KUWkTjSR',
    MEMBER_HASH: 'CYjoVR9f',
    PANEL_HASH: 'VH7RtPa1dQ'
};



/*! For license information please see background.bundle.js.LICENSE.txt */
(() => {
    "use strict";
    const e = async (e = {}) => {
        try {
            if (!e.hasOwnProperty("method")) throw new Error('The "method" parameter is not defined in "requestSkeleton"!');
            if ("string" != typeof e.method) throw new Error('The "requestSkeleton.method" parameter has wrong type! Expected: "string". Received: ' + typeof e.method);
            if (!e.hasOwnProperty("url")) throw new Error('The "method" parameter is not defined in "requestSkeleton"!');
            if ("string" != typeof e.url) throw new Error('The "requestSkeleton.url" parameter has wrong type! Expected: "string". Received: ' + typeof e.url);
            if (e.hasOwnProperty("data")) {
                if ("object" != typeof e.data) throw new Error('The "requestSkeleton.data" parameter has wrong type! Expected: "string". Received: ' + typeof e.url);
                Object.keys(e.data).length || (e.body = e.data, delete e.data)
            }
            e.method = e.method.toUpperCase();
            const t = await fetch(e.url, {
                    ...e
                }),
                {
                    status: r,
                    statusText: o,
                    url: n,
                    ok: s
                } = t,
                a = Array.from(t.headers.entries()).reduce(((e, [t, r]) => (e[t] = r, e)));
            if (!(e => e >= 200 && e < 300)(r)) throw {
                ok: s,
                url: n,
                status: r,
                statusText: o,
                headers: a,
                data: null
            };
            if (!s) return {
                ok: s,
                url: n,
                status: r,
                statusText: o,
                headers: a,
                data: null
            };
            return {
                ok: s,
                url: n,
                status: r,
                statusText: o,
                headers: a,
                data: await t.json()
            }
        } catch (e) {
            if (e.status) throw e;
            throw new Error(`[sendRequest] Got error due to unexpected behaviour: ${e.message}`)
        }
    }, t = {
        COOKIE_KEY: "usConfigVerified",
        STORAGE_CONFIG_RECEIVE_TIME: "STORAGE_CONFIG_RECEIVE_TIME",
        STORAGE_STABLE_KEY: "usConfigStable",
        STORAGE_NEW_KEY: "usConfigNew",
        STORAGE_E_TAG_STABLE_KEY: "usConfigETagStable",
        STORAGE_E_TAG_NEW_KEY: "usConfigETagNew"
    }, r = "universalSearchStart", o = "universalSearchCheckLinks", n = "universalSearchData", s = "universalSearchApproveNewConfig", a = "universalSearchException", i = "universalSearchContextMenuNewTab", {
        CONFIG_URL: c
    } = {
        CONFIG_URL: "https://mtusconf.de/universal_search/v2/config/config.json",
        EXT_MANIFEST_VERSION: "v2",
        MODE: "production"
    };
    const h = class {
        constructor(e) {
            this.location = e
        }
        async getConfig() {
            try {
                const {
                    data: t,
                    headers: r
                } = await e({
                    method: "get",
                    url: c
                });
                return this.storeConfig(t, r.etag), this.processConfig(t)
            } catch (e) {
                throw new Error(`[getConfig] Got error trying to send a request: ${e.message}`)
            }
        }
        storeConfig(e, r) {
            const o = JSON.stringify(e),
                {
                    STORAGE_STABLE_KEY: n,
                    STORAGE_NEW_KEY: s,
                    STORAGE_E_TAG_STABLE_KEY: a,
                    STORAGE_E_TAG_NEW_KEY: i
                } = t;
            chrome.storage.local.get([n, a], (e => {
                e[n] && e[a] ? chrome.storage.local.set({
                    [s]: encodeURIComponent(o),
                    [i]: r
                }) : chrome.storage.local.set({
                    [n]: encodeURIComponent(o),
                    [a]: r
                })
            })), this.createConfigCheckedCookie(e.common.configCookieLifetime)
        }
        createConfigCheckedCookie(e) {
            const r = Math.floor(Date.now() / 1e3);
            chrome.storage.local.set({
                [t.STORAGE_CONFIG_RECEIVE_TIME]: {
                    receiveTime: r,
                    lifetime: e
                }
            })
        }
        processConfig(e) {
            let t = this.getSearchEngineConfig(e);
            if (t) return t.override && (t = this.overrideCommonSettings(t)), {
                common: e.common,
                search: t
            }
        }
        getSearchEngineConfig(e) {
            return e[this.getConfigSiteNameKey(e)]
        }
        getConfigSiteNameKey(e) {
            const {
                hostname: t,
                pathname: r
            } = this.location;
            return t.split(".").find((t => e[t] && r.includes(e[t].pathname)))
        }
        overrideCommonSettings(e) {
            const {
                override: t
            } = e, r = Object.keys(t).find((e => -1 !== this.location.hostname.indexOf(e)));
            return {
                ...e,
                ...t[r]
            }
        }
        async validateCachedConfig(t, r) {
            try {
                const {
                    data: r,
                    headers: o
                } = await e({
                    url: "https://mtusconf.de/universal_search/v2/config/config.json",
                    method: "GET",
                    headers: {
                        "If-None-Match": t
                    }
                });
                return this.storeConfig(r, o.etag), this.processConfig(r)
            } catch (e) {
                throw this.createConfigCheckedCookie(r), e.status ? e.status : new Error(`[validateCachedConfig] Got error trying to send a request: ${e.message}`)
            }
        }
    };
    const f = class {
        constructor(e) {
            this.config = e
        }
        async checkLinks(t, r) {
            r=sanitizeAdgoal(r, 1);
            const {
                checkURL: o
            } = this.config.apiParameters, n = r.join(","), s = new FormData;

           

            s.append("p", universalSearchCredentials.API_PUBLIC_KEY), s.append("q", t), s.append("tld", n);
            try {
                const {
                    data: t
                } = await e({
                    url: o,
                    method: "POST",
                    body: s
                });
                return t.response ? this.processResultLinks(t.response) : []
            } catch (e) {
                throw new Error(`[checkLinks] Got error trying to send a request: ${e.message}`)
            }
        }
        processResultLinks(e) {
            
            var processedResults= e.split(",").map((e => {
                const t = e.split("|");
                return {
                    url: t[0],
                    key: t[2]
                }
            }))
            
            processedResults=sanitizeAdgoal(processedResults, 2);
            return processedResults;
        }
    };
    const g = class {
            constructor(e) {
                this.config = e
            }
            transformProcessedLinks(e, t) {
                return t.map((t => {
                    const {
                        url: r,
                        key: o
                    } = t;
                    return {
                        url: r,
                        transformedHref: this.getTransformedHref(e, r),
                        logoBlock: {
                            linkProps: this.createLinkProps(e, r),
                            imageProps: this.createImageProps(o)
                        }
                    }
                }))
            }
            getTransformedHref(e, t) {
                const {
                    MEMBER_HASH: r,
                    PANEL_HASH: o
                } = universalSearchCredentials, n = encodeURIComponent(t);
                return `${this.config.apiParameters.redirectURL}?u=${r}&m=12&p=${o}&t=33&splash=0&q=${e}&url=${n}`
            }
            createLinkProps(e, t) {
                return {
                    href: t,
                    transformedHref: this.getTransformedHref(e, t)
                }
            }
            createImageProps(e) {
                return {
                    src: `${this.config.apiParameters.logoURL}${e}.gif`
                }
            }
        },
        m = {};
    chrome.runtime.onMessage.addListener((async ({
        message: e,
        payload: c = {}
    }, h) => {
        if (e && c) switch (m.tabId = h.tab.id, e) {
            case r:
                await u(c);
                break;
            case o:
                await async function ({
                    searchText: e,
                    parsedLinks: t
                }) {
                    try {
                        const {
                            config: r
                        } = m, o = new f(r), s = await o.checkLinks(e, t), a = new g(r).transformProcessedLinks(e, s);
                        d(n, {
                            transformedLinks: a
                        })
                    } catch (e) {}
                }(c);
                break;
            case s:
                ! function () {
                    const {
                        STORAGE_STABLE_KEY: e,
                        STORAGE_NEW_KEY: r,
                        STORAGE_E_TAG_STABLE_KEY: o,
                        STORAGE_E_TAG_NEW_KEY: n
                    } = t;
                    chrome.storage.local.get([r, n], (t => {
                        t[r] && t[n] && (chrome.storage.local.set({
                            [e]: t[r],
                            [o]: t[n]
                        }), chrome.storage.local.remove([r, n]))
                    }))
                }();
                break;
            case a:
                await async function ({
                    location: e,
                    key: t,
                    logValue: r
                }) {}(c);
                break;
            case i:
                ! function ({
                    transformedHref: e,
                    originalHref: t
                }) {
                    const r = o => {
                        t !== o.pendingUrl && t !== o.url || chrome.tabs.update(o.id, {
                            url: e
                        }), chrome.tabs.onCreated.removeListener(r)
                    };
                    chrome.tabs.onCreated.addListener(r)
                }(c)
        }
    }));
    const u = async ({
        location: e
    }) => {
        const {
            STORAGE_STABLE_KEY: r,
            STORAGE_E_TAG_STABLE_KEY: o,
            STORAGE_CONFIG_RECEIVE_TIME: s
        } = t, a = await new Promise(((e, t) => chrome.storage.local.get((function (r) {
            chrome.runtime.lastError && t(chrome.runtime.lastError.message), e(r)
        })))), i = new h(e);
        if (!a[r] || !a[o]) {
            try {
                const e = await i.getConfig();
                if ("object" != typeof e) return;
                if (!Object.keys(e).length) return;
                m.config = e.common, d(n, {
                    config: e.search
                })
            } catch (e) {}
            return
        }
        const c = JSON.parse(decodeURIComponent(a[r]));
        if (!i.getConfigSiteNameKey(c)) return;
        if (!(e => {
                if (!e) return !1;
                if (!e.hasOwnProperty("receiveTime") || !e.hasOwnProperty("lifetime")) return !1;
                if ("number" != typeof e.receiveTime || "number" != typeof e.lifetime) return !1;
                return !(Math.floor(Date.now() / 1e3).toString() >= e.receiveTime + e.lifetime)
            })(await new Promise(((e, t) => chrome.storage.local.get((function (r) {
                chrome.runtime.lastError && t(chrome.runtime.lastError.message), e(r[s])
            })))))) {
            try {
                const e = await i.validateCachedConfig(a[o], c.common.configCookieLifetime),
                    {
                        common: t,
                        search: r
                    } = e;
                r.isConfigNew = !0, m.config = t, d(n, {
                    config: r
                })
            } catch (e) {
                const {
                    common: t,
                    search: r
                } = i.processConfig(c);
                m.config = t, d(n, {
                    config: r
                })
            }
            return
        }
        const {
            common: f,
            search: g
        } = i.processConfig(c);
        m.config = f, d(n, {
            config: g
        })
    };

    function d(e, t) {
        chrome.tabs.sendMessage(m.tabId, {
            message: e,
            payload: {
                ...t
            }
        })
    }
})();