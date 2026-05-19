import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { termsOfServiceData } from "../data/legal/termsOfService";
import { apiTermsData } from "../data/legal/apiTerms";
import { packsTermsData } from "../data/legal/packsTerms";
import { privacyPolicyData } from "../data/legal/privacyPolicy";
import { otherPoliciesData } from "../data/legal/otherPolicies";

const DOCUMENT_DATA = [
  { key: "tos",     ...termsOfServiceData },
  { key: "api",     ...apiTermsData },
  { key: "packs",   ...packsTermsData },
  { key: "privacy", ...privacyPolicyData },
  { key: "copy",    ...otherPoliciesData.copyright },
  { key: "tm",      ...otherPoliciesData.trademark },
  { key: "law",     ...otherPoliciesData.lawEnforcement },
];

/* ── Renderers ── */
function RenderBlock({ block }) {
  if (!block) return null;
  switch (block.type) {
    case "p":
      return <p className="text-white/60 text-sm leading-relaxed">{block.text}</p>;
    case "bold-p":
      return (
        <p className="text-white/60 text-sm leading-relaxed">
          <strong className="text-white/85">{block.label}</strong> {block.text}
        </p>
      );
    case "caps":
      return <p className="text-white/60 text-sm leading-relaxed uppercase">{block.text}</p>;
    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0 bg-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "important":
      return (
        <div className="rounded-xl p-5 my-4 text-sm leading-relaxed"
          style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,42,168,0.3)" }}>
          <strong className="text-white block mb-1 uppercase tracking-wider text-xs">
            {block.label || "Important Notice"}
          </strong>
          <span className="text-white/65">{block.text}</span>
        </div>
      );
    case "subsection":
      return (
        <div
          className="rounded-2xl p-6 mb-2"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="font-semibold text-white text-sm mb-3">{block.title}</h3>
          <div className="space-y-3">
            {(block.content || []).map((b, i) => <RenderBlock key={i} block={b} />)}
          </div>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {block.headers.map(h => (
                  <th key={h} className="text-left text-white/30 text-xs font-semibold py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((v, ci) => (
                    <td key={ci} className={`py-2.5 pr-4 text-sm ${ci === 0 ? "text-white/70 font-medium" : "text-white/50"}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return <p className="text-white/60 text-sm leading-relaxed">{block.text || ""}</p>;
  }
}

/* ── Main ── */
export default function TermsPage() {
  const { t } = useTranslation();
  const DOCUMENTS = DOCUMENT_DATA.map(d => ({ ...d, label: t(`terms.docs.${d.key}`) }));
  const [activeDoc, setActiveDoc] = useState("tos");
  const [activeSection, setActiveSection] = useState("");
  const [tocOpen, setTocOpen] = useState(false);

  const doc = DOCUMENTS.find(d => d.key === activeDoc) || DOCUMENTS[0];
  const sections = doc.sections || [];

  const switchDoc = useCallback((key) => {
    setActiveDoc(key);
    setTocOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* scroll-spy */
  useEffect(() => {
    if (!sections.length) return;
    setActiveSection(sections[0]?.id || "");
    const onScroll = () => {
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 60) {
        setActiveSection(sections[sections.length - 1]?.id || "");
        return;
      }
      const offset = window.scrollY + 140;
      let current = sections[0]?.id || "";
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= offset) current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeDoc, sections]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: "smooth" });
    setTocOpen(false);
  }, []);

  return (
    <div className="min-h-screen text-white mt-12">

      {/* ── Mobile TOC toggle ── */}
      <div className="lg:hidden sticky top-[68px] z-40 px-4 py-3"
        style={{ background: "rgba(0,8,32,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => setTocOpen(!tocOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-white/70">
          <span>☰</span> {t("terms.contents")}
        </button>
        {tocOpen && (
          <div className="mt-3 flex flex-col gap-1">
            {/* Mobile doc switcher */}
            <p className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase mb-1 px-3">{t("terms.documents")}</p>
            {DOCUMENTS.map(({ key, label }) => (
              <button key={key} onClick={() => switchDoc(key)}
                className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeDoc === key ? "text-blue-400 bg-blue-900/30 font-semibold" : "text-white/40 hover:text-white"
                }`}>
                {label}
              </button>
            ))}
            <div className="border-t border-white/5 my-2" />
            <p className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase mb-1 px-3">{t("terms.sections")}</p>
            {sections.map(({ id, title }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeSection === id ? "text-white bg-blue-900/40" : "text-white/50 hover:text-white"
                }`}>
                {t(`terms.sectionTitles.${id}`, { defaultValue: title })}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex items-start">

        {/* ── Sidebar (sticky, same pattern as whitepaper) ── */}
        <aside
          className="hidden lg:flex flex-col shrink-0 w-[260px] sidebar-custom-scroll"
          style={{
            position: "sticky",
            top: 68,
            alignSelf: "flex-start",
            height: "calc(100vh - 68px)",
            overflowY: "auto",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: "32px 20px",
          }}
        >
          {/* Document switcher */}
          <p className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase mb-3">{t("terms.documents")}</p>
          <nav className="flex flex-col gap-0.5 mb-4">
            {DOCUMENTS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => switchDoc(key)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 font-medium ${
                  activeDoc === key
                    ? "text-blue-400 bg-blue-900/30 border-l-2 border-blue-500 pl-2"
                    : "text-white/35 hover:text-white/60"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Section nav */}
          {sections.length > 0 && (
            <>
              <div className="border-t border-white/5 mb-4" />
              <p className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase mb-3">{t("terms.sections")}</p>
              <nav className="flex flex-col gap-0.5 overflow-y-auto flex-1 sidebar-custom-scroll">
                {sections.map(({ id, title }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`text-left px-3 py-1.5 rounded-lg text-[12px] leading-snug transition-all duration-200 ${
                      activeSection === id
                        ? "text-white bg-blue-900/40 border-l-2 border-blue-500 pl-2 font-medium"
                        : "text-white/30 hover:text-white/55"
                    }`}
                  >
                    {t(`terms.sectionTitles.${id}`, { defaultValue: title })}
                  </button>
                ))}
              </nav>
            </>
          )}

          <div className="mt-4">
            <Link to="/"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-300 border border-white/20 hover:border-white/40"
              style={{ background: "#002AA8" }}>
              {t("terms.backToHome")}
            </Link>
          </div>
        </aside>

        {/* ── Main content — full width from sidebar to right edge ── */}
        <main className="flex-1 px-8 lg:px-16 py-16 space-y-16">

          {/* Header */}
          <div>
            <h1 className="font-[Goldman] text-3xl md:text-4xl font-bold text-white mb-2">{doc.label}</h1>
            <p className="text-white/30 text-sm">{t("terms.lastUpdated")}: {doc.lastUpdated}</p>
          </div>

          {/* Intro */}
          {doc.intro && (
            <div
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-white/60 text-sm leading-relaxed">{doc.intro}</p>
            </div>
          )}

          {/* Notice */}
          {doc.notice && (
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,42,168,0.3)" }}>
              <strong className="text-white block mb-2 uppercase tracking-wider text-xs">
                {doc.notice.label || t("terms.importantNotice")}
              </strong>
              <p className="text-white/65 text-sm leading-relaxed">{doc.notice.text}</p>
            </div>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="pt-2">
              {/* Heading */}
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1 h-7 rounded-full bg-[#002AA8] shrink-0" />
                <h2 className="font-[Goldman] text-xl md:text-2xl font-bold text-white">{t(`terms.sectionTitles.${section.id}`, { defaultValue: section.title })}</h2>
              </div>
              <div className="space-y-4">
                {(section.content || []).map((block, i) => (
                  <RenderBlock key={i} block={block} />
                ))}
              </div>
            </section>
          ))}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link to="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm text-white transition-all duration-300 border border-white/20 hover:border-white/40 hover:bg-[#003BD4]"
              style={{ background: "#002AA8" }}>
              {t("terms.backToHome")}
            </Link>
            <p className="text-white/20 text-xs">© {new Date().getFullYear()} Hyper Tek. {t("terms.allRights")}</p>
          </div>

        </main>
      </div>
    </div>
  );
}
