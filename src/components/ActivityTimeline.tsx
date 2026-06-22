"use client";

import { useState, useEffect } from "react";

interface Decision {
  decisionType: string;
  score: string;
  timestamp: string;
  txHash: string;
}

const TYPE_COLOR: Record<string, string> = {
  HIGH_WHALE_ACTIVITY: "var(--crimson)",
  WHALE_DETECTED: "var(--crimson)",
  HIGH_VOLUME: "var(--navy)",
  NORMAL: "var(--green)",
  QUIET_PERIOD: "var(--faint)",
};

export function ActivityTimeline() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await window.fetch("/api/agent/decisions");
        const data = await res.json();
        setDecisions(data.decisions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return null;
  if (decisions.length === 0) return null;

  // Group by hour
  const hourBuckets: Record<string, Decision[]> = {};
  decisions.forEach((d) => {
    if (!d.timestamp) return;
    const date = new Date(parseInt(d.timestamp) * 1000);
    const key = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    if (!hourBuckets[key]) hourBuckets[key] = [];
    hourBuckets[key].push(d);
  });

  const hours = Object.entries(hourBuckets).slice(0, 8).reverse();
  const maxCount = Math.max(...hours.map(([, d]) => d.length));

  return (
    <div className="card section-gap">
      <div className="card-title">Activity Timeline</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
        {hours.map(([hour, decs]) => {
          const whales = decs.filter(d => d.decisionType.includes("WHALE")).length;
          const height = Math.max(8, (decs.length / maxCount) * 72);
          return (
            <div key={hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%",
                height: `${height}px`,
                background: whales > 0 ? "var(--crimson)" : "var(--navy)",
                borderRadius: 2,
                opacity: 0.8,
                transition: "height 0.3s",
                position: "relative",
              }}
                title={`${decs.length} decisions · ${whales} whale${whales !== 1 ? "s" : ""}`}
              >
                {whales > 0 && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    fontSize: 10, color: "var(--crimson)", fontFamily: "var(--mono)",
                  }}>⚠</div>
                )}
              </div>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)",
                textAlign: "center", whiteSpace: "nowrap",
              }}>
                {hour.split(" ")[1]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, background: "var(--navy)", borderRadius: 1, display: "inline-block" }} />
          Normal/High Volume
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, background: "var(--crimson)", borderRadius: 1, display: "inline-block" }} />
          Whale Activity
        </span>
      </div>
    </div>
  );
}