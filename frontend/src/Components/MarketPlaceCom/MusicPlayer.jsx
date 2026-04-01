import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music, Volume2, VolumeX, X, ChevronDown } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseSpotifyEmbed(url) {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("spotify.com")) return null;
    // pathname: /track/ID, /playlist/ID, /album/ID
    const match = u.pathname.match(/^\/(track|playlist|album|episode)\/([A-Za-z0-9]+)/);
    if (!match) return null;
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
}

function parseSoundCloudEmbed(url) {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("soundcloud.com")) return null;
    const encoded = encodeURIComponent(url.trim());
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%23002AA8&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  } catch {
    return null;
  }
}

const SOURCES = ["spotify", "ambient", "soundcloud"];
const SOURCE_LABELS = { ambient: "Ambient", spotify: "Spotify", soundcloud: "SoundCloud" };

const LS_KEY = "htek_music_player";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
}

function savePrefs(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MusicPlayer({ audioSrc = "/audio/marketplace_ambient.mp3" }) {
  const prefs = loadPrefs();

  const [open, setOpen]         = useState(false);
  const [source, setSource]     = useState(prefs.source || "spotify");
  const [playing, setPlaying]   = useState(false);
  const [volume, setVolume]     = useState(prefs.volume ?? 0.5);

  // Spotify / SoundCloud
  const [spotifyUrl, setSpotifyUrl]         = useState(prefs.spotifyUrl || "");
  const [soundcloudUrl, setSoundcloudUrl]   = useState(prefs.soundcloudUrl || "");
  const [spotifyEmbed, setSpotifyEmbed]     = useState(prefs.spotifyEmbed || "");
  const [soundcloudEmbed, setSoundcloudEmbed] = useState(prefs.soundcloudEmbed || "");
  const [urlError, setUrlError]             = useState("");

  const audioRef  = useRef(null);
  const panelRef  = useRef(null);

  // ── Ambient audio ───────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (source === "ambient" && playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [source, playing]);

  const toggleAmbient = () => {
    if (playing) {
      setPlaying(false);
    } else {
      setPlaying(true);
    }
  };

  // ── Persist prefs ────────────────────────────────────────────────────────────
  useEffect(() => {
    savePrefs({ source, volume, spotifyUrl, soundcloudUrl, spotifyEmbed, soundcloudEmbed });
  }, [source, volume, spotifyUrl, soundcloudUrl, spotifyEmbed, soundcloudEmbed]);

  // ── Close panel on outside click ────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── URL submit ───────────────────────────────────────────────────────────────
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setUrlError("");
    if (source === "spotify") {
      const embed = parseSpotifyEmbed(spotifyUrl);
      if (!embed) { setUrlError("Invalid Spotify URL. Try a track, playlist, or album link."); return; }
      setSpotifyEmbed(embed);
    } else if (source === "soundcloud") {
      const embed = parseSoundCloudEmbed(soundcloudUrl);
      if (!embed) { setUrlError("Invalid SoundCloud URL."); return; }
      setSoundcloudEmbed(embed);
    }
  };

  const clearEmbed = () => {
    if (source === "spotify") { setSpotifyEmbed(""); setSpotifyUrl(""); }
    if (source === "soundcloud") { setSoundcloudEmbed(""); setSoundcloudUrl(""); }
  };

  // ── Status label for collapsed button ───────────────────────────────────────
  const statusLabel = () => {
    if (source === "ambient") return playing ? "Playing" : "Sound";
    return SOURCE_LABELS[source];
  };

  const activeEmbed = source === "spotify" ? spotifyEmbed : source === "soundcloud" ? soundcloudEmbed : null;

  return (
    <div className="relative flex-shrink-0" ref={panelRef}>
      {/* Hidden ambient audio element */}
      <audio ref={audioRef} src={audioSrc} loop preload="auto" />

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
        style={{
          background: open ? "rgba(0,42,168,0.4)" : "rgba(255,255,255,0.07)",
          border: open ? "1px solid rgba(0,100,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
          color: open ? "rgba(150,200,255,0.95)" : "rgba(255,255,255,0.7)",
        }}
        title="Music player"
      >
        {source === "ambient" && !playing
          ? <VolumeX className="w-4 h-4" />
          : <Music className="w-4 h-4" />
        }
        <span className="hidden sm:inline">{statusLabel()}</span>
        <ChevronDown
          className="w-3 h-3 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* ── Floating panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-[300px] rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "rgba(4, 8, 30, 0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              zIndex: 999,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-blue-400" />
                <span className="text-white text-xs font-semibold tracking-wide">Music Player</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source selector */}
            <div className="flex gap-1 px-3 pt-3">
              {SOURCES.map(s => (
                <button
                  key={s}
                  onClick={() => { setSource(s); setUrlError(""); }}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
                  style={{
                    background: source === s ? "rgba(0,42,168,0.5)" : "rgba(255,255,255,0.05)",
                    border: source === s ? "1px solid rgba(0,100,255,0.4)" : "1px solid transparent",
                    color: source === s ? "rgba(150,200,255,0.95)" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="px-3 pb-3 pt-2">

              {/* ── AMBIENT ── */}
              {source === "ambient" && (
                <div className="flex flex-col gap-3 pt-1">
                  <p className="text-white/35 text-[10px] leading-relaxed">
                    Built-in ambient soundtrack for the marketplace. Plays on loop.
                  </p>
                  <button
                    onClick={toggleAmbient}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{
                      background: playing ? "rgba(0,42,168,0.4)" : "rgba(255,255,255,0.06)",
                      border: playing ? "1px solid rgba(0,100,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                      color: playing ? "rgba(150,200,255,0.95)" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {playing ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    {playing ? "Pause Ambient" : "Play Ambient"}
                  </button>
                  {/* Volume slider */}
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
                        setVolume(v);
                        if (audioRef.current) audioRef.current.volume = v;
                      }}
                      className="flex-1 h-1 accent-blue-500 cursor-pointer"
                      style={{ accentColor: "#3b82f6" }}
                    />
                    <Volume2 className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                  </div>
                </div>
              )}

              {/* ── SPOTIFY ── */}
              {source === "spotify" && (
                <div className="flex flex-col gap-2 pt-1">
                  {!spotifyEmbed ? (
                    <>
                      <p className="text-white/35 text-[10px] leading-relaxed">
                        Paste any Spotify track, playlist, or album link.
                      </p>
                      <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={spotifyUrl}
                          onChange={e => { setSpotifyUrl(e.target.value); setUrlError(""); }}
                          placeholder="https://open.spotify.com/track/..."
                          className="w-full px-3 py-2 rounded-lg text-[11px] text-white placeholder-white/20 outline-none"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: urlError ? "1px solid rgba(255,80,80,0.5)" : "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                        {urlError && <p className="text-red-400 text-[10px]">{urlError}</p>}
                        <button
                          type="submit"
                          className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                          style={{
                            background: "rgba(30,215,96,0.15)",
                            border: "1px solid rgba(30,215,96,0.3)",
                            color: "rgba(30,215,96,0.9)",
                          }}
                        >
                          Load Spotify
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <iframe
                        src={spotifyEmbed}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl"
                      />
                      <button
                        onClick={clearEmbed}
                        className="text-[10px] text-white/30 hover:text-white/60 transition-colors text-right"
                      >
                        Change link
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── SOUNDCLOUD ── */}
              {source === "soundcloud" && (
                <div className="flex flex-col gap-2 pt-1">
                  {!soundcloudEmbed ? (
                    <>
                      <p className="text-white/35 text-[10px] leading-relaxed">
                        Paste any SoundCloud track or playlist link.
                      </p>
                      <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={soundcloudUrl}
                          onChange={e => { setSoundcloudUrl(e.target.value); setUrlError(""); }}
                          placeholder="https://soundcloud.com/..."
                          className="w-full px-3 py-2 rounded-lg text-[11px] text-white placeholder-white/20 outline-none"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: urlError ? "1px solid rgba(255,80,80,0.5)" : "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                        {urlError && <p className="text-red-400 text-[10px]">{urlError}</p>}
                        <button
                          type="submit"
                          className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                          style={{
                            background: "rgba(255,85,0,0.15)",
                            border: "1px solid rgba(255,85,0,0.3)",
                            color: "rgba(255,140,80,0.9)",
                          }}
                        >
                          Load SoundCloud
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <iframe
                        width="100%"
                        height="120"
                        scrolling="no"
                        frameBorder="no"
                        src={soundcloudEmbed}
                        className="rounded-xl"
                      />
                      <button
                        onClick={clearEmbed}
                        className="text-[10px] text-white/30 hover:text-white/60 transition-colors text-right"
                      >
                        Change link
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
