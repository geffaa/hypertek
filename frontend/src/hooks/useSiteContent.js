import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:4700"}/api/v1/site-content`;

const LS_KEY = "cms_cache";

function loadCache() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    } catch {
        return {};
    }
}

function saveCache(c) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(c));
    } catch {}
}

const cache = loadCache();

export default function useSiteContent(sectionKey) {
    const [data, setData] = useState(cache[sectionKey] || {});
    const [loading, setLoading] = useState(!cache[sectionKey]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (cache[sectionKey]) {
            setData(cache[sectionKey]);
            setLoading(false);
        }

        let cancelled = false;

        const fetchContent = async () => {
            try {
                const res = await axios.get(`${API_BASE}/${sectionKey}`);
                if (!cancelled && res.data.success) {
                    const fieldMap = {};
                    for (const field of res.data.section.fields) {
                        fieldMap[field.key] = field.value;
                    }
                    cache[sectionKey] = fieldMap;
                    saveCache(cache);
                    setData(fieldMap);
                }
            } catch (err) {
                if (!cancelled) {
                    console.warn(`CMS: "${sectionKey}" not available, using defaults`);
                    setError(err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchContent();
        return () => { cancelled = true; };
    }, [sectionKey]);

    return { data, loading, error };
}

export function useSiteContentPage(pageGroup) {
    const [sections, setSections] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const cached = {};
        let hasCached = false;
        for (const key of Object.keys(cache)) {
            if (key.startsWith(pageGroup + "_") || key.startsWith(pageGroup)) {
                cached[key] = cache[key];
                hasCached = true;
            }
        }
        if (hasCached) {
            setSections(cached);
            setLoading(false);
        }

        const fetchPage = async () => {
            try {
                const res = await axios.get(`${API_BASE}/page/${pageGroup}`);
                if (!cancelled && res.data.success) {
                    const result = {};
                    for (const section of res.data.sections) {
                        const fieldMap = {};
                        for (const field of section.fields) {
                            fieldMap[field.key] = field.value;
                        }
                        result[section.sectionKey] = fieldMap;
                        cache[section.sectionKey] = fieldMap;
                    }
                    saveCache(cache);
                    setSections(result);
                }
            } catch (err) {
                if (!cancelled) {
                    console.warn(`CMS: page "${pageGroup}" not available, using defaults`);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPage();
        return () => { cancelled = true; };
    }, [pageGroup]);

    return { sections, loading };
}
