import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Zap, Gavel, Gamepad2, Wallet } from "lucide-react";
import { BACKEND_BASE_URL } from "../../Config";

/* messages that pop up near the button when chat is closed */
const PEEK_MESSAGES = [
  "Need help? Ask me anything!",
  "Questions about HyperBucks?",
  "Curious how auctions work?",
];

/* shortcut chips shown at the start */
const SHORTCUTS = [
  { Icon: Zap,      label: "Earn HyperBucks",  text: "How do I earn HyperBucks?" },
  { Icon: Wallet,   label: "Cash Out HB",       text: "How do I cash out my HyperBucks?" },
  { Icon: Gavel,    label: "How Auctions Work", text: "How do auctions work?" },
  { Icon: Gamepad2, label: "Available Games",   text: "What games are available on HyperTek100?" },
];

/* ── Typing dots ── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-none"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              background: "rgba(0,120,255,0.8)",
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Bot avatar ── */
function BotAvatar() {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
      style={{
        background: "linear-gradient(135deg, #002AA8 0%, #1D7AD6 100%)",
        border: "1px solid rgba(0,120,255,0.5)",
        boxShadow: "0 0 8px rgba(0,100,255,0.4)",
        fontFamily: "'Goldman', sans-serif",
      }}
    >
      HB
    </div>
  );
}

/* ── Scanline overlay ── */
function Scanlines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-t-2xl"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      }}
    />
  );
}

/* ── Shortcut chip ── */
function ShortcutChip({ Icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-medium transition-all duration-200"
      style={{
        background: hovered ? "rgba(0,42,168,0.45)" : "rgba(255,255,255,0.04)",
        border: hovered ? "1px solid rgba(0,100,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
        color: hovered ? "#fff" : "rgba(255,255,255,0.6)",
        boxShadow: hovered ? "0 0 10px rgba(0,60,255,0.2)" : "none",
        cursor: "pointer",
      }}
    >
      <Icon size={11} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! I'm HyperBot, your HyperTek100 AI assistant. Ask me anything about the platform, marketplace, games, or NFTs!",
    },
  ]);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const textareaRef = useRef(null);

  /* only show shortcuts before first user message */
  const showShortcuts = messages.length === 1;

  /* ── peek bubble ── */
  // peekState: { phase: "idle"|"in"|"out", text: string }
  const [peekState, setPeekState] = useState({ phase: "idle", text: "" });
  const peekTimer = useRef(null);

  useEffect(() => {
    if (open) {
      clearTimeout(peekTimer.current);
      setPeekState({ phase: "idle", text: "" });
      return;
    }

    const runAt = (idx) => {
      // 1. show bubble
      setPeekState({ phase: "in", text: PEEK_MESSAGES[idx] });

      // 2. after display time → start exit
      peekTimer.current = setTimeout(() => {
        setPeekState((s) => ({ ...s, phase: "out" }));

        // 3. after exit animation → idle, then maybe next
        peekTimer.current = setTimeout(() => {
          setPeekState({ phase: "idle", text: "" });
          const next = (idx + 1) % PEEK_MESSAGES.length;
          peekTimer.current = setTimeout(() => runAt(next), 1600);
        }, 350);
      }, 3200);
    };

    peekTimer.current = setTimeout(() => runAt(0), 2500);
    return () => clearTimeout(peekTimer.current);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 100);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > 100 ? "auto" : "hidden";
  };

  const buildHistory = () =>
    messages.slice(1).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/chatbot/message`,
        { message: text, history: buildHistory() }
      );
      setMessages((prev) => [...prev, { role: "model", text: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I could not get a response right now. Please try again or contact our support team.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = input.trim() && !loading;

  return (
    <>
      {/* ── Chat Panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[9999] flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: 360,
            maxWidth: "calc(100vw - 2.5rem)",
            height: 520,
            background: "linear-gradient(160deg, #0a0c1e 0%, #05060f 100%)",
            border: "1px solid rgba(0,80,255,0.3)",
            boxShadow:
              "0 0 0 1px rgba(0,60,255,0.08), 0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,60,255,0.12)",
          }}
        >
          {/* ── Header ── */}
          <div
            className="relative flex items-center justify-between px-4 py-3 flex-shrink-0 overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,42,168,0.5) 0%, rgba(0,10,40,0.6) 100%)",
              borderBottom: "1px solid rgba(0,80,255,0.25)",
            }}
          >
            <Scanlines />

            <div className="flex items-center gap-3 relative z-20">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #002AA8 0%, #1D7AD6 100%)",
                  border: "1px solid rgba(0,140,255,0.6)",
                  boxShadow: "0 0 14px rgba(0,100,255,0.5)",
                  fontFamily: "'Goldman', sans-serif",
                }}
              >
                HB
              </div>
              <div>
                <p
                  className="text-white text-sm font-bold"
                  style={{ fontFamily: "'Goldman', sans-serif", letterSpacing: "0.08em" }}
                >
                  HYPERBOT
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                  />
                  <span className="text-[10px] text-green-400 font-medium tracking-wider uppercase">
                    Online
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="relative z-20 text-white/30 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── Messages ── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 modal-custom-scroll"
            style={{ background: "transparent" }}
          >
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div
                      className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-br-none text-[13px] leading-relaxed text-white whitespace-pre-wrap break-words"
                      style={{
                        background: "rgba(0,42,168,0.85)",
                        border: "1px solid rgba(0,80,255,0.4)",
                        boxShadow: "0 0 12px rgba(0,60,255,0.15)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-end gap-2">
                    <BotAvatar />
                    <div
                      className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-bl-none text-[13px] leading-relaxed whitespace-pre-wrap break-words"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              )}

              {/* ── Shortcut chips (only before first user message) ── */}
              {showShortcuts && !loading && (
                <div className="flex flex-col gap-2 mt-1">
                  <p
                    className="text-[10px] uppercase tracking-widest pl-9"
                    style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Goldman', sans-serif" }}
                  >
                    Quick questions
                  </p>
                  <div className="flex flex-wrap gap-2 pl-9">
                    {SHORTCUTS.map((s) => (
                      <ShortcutChip
                        key={s.label}
                        Icon={s.Icon}
                        label={s.label}
                        onClick={() => sendMessage(s.text)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* ── Input area ── */}
          <div
            className="flex items-end gap-2 px-3 py-3 flex-shrink-0"
            style={{
              borderTop: "1px solid rgba(0,80,255,0.2)",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <textarea
              ref={(el) => {
                inputRef.current = el;
                textareaRef.current = el;
              }}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything... (Enter to send)"
              disabled={loading}
              className="chatbot-textarea flex-1 resize-none outline-none text-[13px] text-white/90 placeholder-white/25 bg-transparent disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0,80,255,0.2)",
                borderRadius: 10,
                padding: "8px 12px",
                lineHeight: "1.45",
                transition: "border-color 0.2s",
                maxHeight: 100,
                overflowY: "hidden",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,100,255,0.55)")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(0,80,255,0.2)")}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!canSend}
              aria-label="Send message"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: canSend
                  ? "linear-gradient(135deg, #002AA8 0%, #1D7AD6 100%)"
                  : "rgba(255,255,255,0.06)",
                border: canSend
                  ? "1px solid rgba(0,100,255,0.5)"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: canSend ? "0 0 14px rgba(0,80,255,0.35)" : "none",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                cursor: canSend ? "pointer" : "default",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13"
                  stroke={canSend ? "white" : "rgba(255,255,255,0.25)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke={canSend ? "white" : "rgba(255,255,255,0.25)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle HyperBot"
        className="fixed bottom-5 right-5 z-[9999]"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          animation: !open ? "hb-float 2s ease-in-out infinite" : "none",
          background: open
            ? "linear-gradient(135deg, #1a1f3e 0%, #0a0c1e 100%)"
            : "linear-gradient(135deg, #002AA8 0%, #1D7AD6 100%)",
          border: "1px solid rgba(0,120,255,0.55)",
          boxShadow: open
            ? "0 0 0 3px rgba(0,80,255,0.15), 0 8px 32px rgba(0,0,0,0.6)"
            : "0 0 0 3px rgba(0,80,255,0.2), 0 0 24px rgba(0,80,255,0.4), 0 8px 32px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.25s",
          cursor: "pointer",
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* ── Pulse ring (only when closed) ── */}
      {!open && (
        <span
          className="fixed bottom-5 right-5 z-[9998] rounded-full pointer-events-none"
          style={{
            width: 56,
            height: 56,
            border: "1px solid rgba(0,100,255,0.45)",
            animation: "chatbot-pulse 2.2s ease-out infinite",
          }}
        />
      )}

      {/* ── Peek bubble — mounted only during "in" or "out" phase ── */}
      {!open && peekState.phase !== "idle" && (
        <div
          key={peekState.text}
          className="fixed z-[9998] pointer-events-none"
          style={{
            bottom: 88,
            right: 20,
            animation: "hb-float 2s ease-in-out infinite",
          }}
        >
          {/* wrapper drives the peek-in/out animation */}
          <div
            style={{
              transformOrigin: "bottom right",
              animationName: peekState.phase === "in" ? "peek-in" : "peek-out",
              animationDuration: peekState.phase === "in" ? "0.38s" : "0.32s",
              animationTimingFunction:
                peekState.phase === "in"
                  ? "cubic-bezier(0.34,1.56,0.64,1)"
                  : "ease-in",
              animationFillMode: "forwards",
            }}
          >
            <div
              style={{
                position: "relative",
                background: "linear-gradient(160deg, #0d1230 0%, #070810 100%)",
                border: "1px solid rgba(0,80,255,0.35)",
                borderRadius: "14px 14px 4px 14px",
                padding: "9px 14px",
                boxShadow: "0 0 24px rgba(0,60,255,0.15), 0 8px 24px rgba(0,0,0,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              <p className="text-white text-[12px] leading-snug">
                {peekState.text}
              </p>
              {/* tail */}
              <div
                style={{
                  position: "absolute",
                  bottom: -6,
                  right: 16,
                  width: 10,
                  height: 10,
                  background: "#070810",
                  border: "1px solid rgba(0,80,255,0.35)",
                  borderTop: "none",
                  borderLeft: "none",
                  transform: "rotate(45deg)",
                  borderRadius: "0 0 2px 0",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chatbot-textarea::-webkit-scrollbar { width: 3px; }
        .chatbot-textarea::-webkit-scrollbar-track { background: transparent; }
        .chatbot-textarea::-webkit-scrollbar-thumb { background: rgba(0,80,255,0.35); border-radius: 10px; }
        .chatbot-textarea { scrollbar-width: thin; scrollbar-color: rgba(0,80,255,0.35) transparent; }
        @keyframes hb-float {
          0%,100% { transform: translateY(0);   }
          50%     { transform: translateY(-7px); }
        }
        @keyframes chatbot-pulse {
          0%   { transform: scale(1);    opacity: 0.6; }
          70%  { transform: scale(1.55); opacity: 0;   }
          100% { transform: scale(1.55); opacity: 0;   }
        }
        @keyframes peek-in {
          from { opacity: 0; transform: scale(0.75) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes peek-out {
          from { opacity: 1; transform: scale(1)    translateY(0);   }
          to   { opacity: 0; transform: scale(0.85) translateY(6px); }
        }
      `}</style>
    </>
  );
}
