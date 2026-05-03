// ── ui.js — componentes visuais compartilhados ───────────────────

const ICON_PATHS = {
  "ghost":            "M9 2a7 7 0 0 0-7 7v8l3-3 2 2 2-2 2 2 2-2 3 3V9a7 7 0 0 0-7-7zm-2 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z",
  "activity":         "M22 12h-4l-3 9L9 3l-3 9H2",
  "archive":          "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
  "bar-chart":        "M12 20V10M18 20V4M6 20v-4",
  "bell":             "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  "book-open":        "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  "check":            "M20 6 9 17l-5-5",
  "clock":            "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  "crown":            "M2 20h20M5 20V10l7-7 7 7v10",
  "eye":              "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "eye-off":          "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  "flame":            "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  "layers":           "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  "list-checks":      "M11 5H21M11 9H21M11 13H21M11 17H21M3 5l1 1 2-2M3 9l1 1 2-2M3 13l1 1 2-2M3 17l1 1 2-2",
  "lock":             "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  "log-out":          "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  "moon":             "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  "package":          "M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  "shield":           "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  "star":             "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  "trending-up":      "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  "user":             "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  "users":            "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  "x":                "M18 6 6 18M6 6l12 12",
  "zap":              "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  "layout-dashboard": "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  "trophy":           "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17a2 2 0 0 1-2 2H7M14 14.66V17a2 2 0 0 0 2 2h1M12 2v1M12 14a7 7 0 0 0 7-7V4H5v3a7 7 0 0 0 7 7z",
  "camera":           "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
};

function Icon({ name, size = 16, color, style = {} }) {
  const d = ICON_PATHS[name] || ICON_PATHS["star"];
  const paths = d.split(/(?=M)/).filter(Boolean);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((p, i) => <path key={i} d={p} />)}
      </svg>
    </span>
  );
}

function Bar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, transition: "width 0.8s ease",
        background: `linear-gradient(90deg,${color}88,${color})`, boxShadow: `0 0 8px ${color}66` }} />
    </div>
  );
}

function Alert({ message, sub, type = "info", onClose }) {
  const c = ({ info:"#4f8cff", warning:"#ffd700", danger:"#ff4466", success:"#00ff88" })[type] || "#4f8cff";
  return (
    <div style={{ background:"rgba(5,5,20,0.97)", border:`1px solid ${c}55`, borderLeft:`3px solid ${c}`,
      borderRadius:4, padding:"14px 18px", minWidth:300, maxWidth:380,
      boxShadow:`0 0 30px ${c}22,0 8px 32px rgba(0,0,0,0.8)`, animation:"notification-in 0.3s ease",
      fontFamily:"var(--font-ui)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div>
          <div style={{ color:c, fontSize:11, letterSpacing:2, fontWeight:700, marginBottom:4, fontFamily:"var(--font-title)" }}>[ SISTEMA ]</div>
          <div style={{ color:"var(--text-bright)", fontSize:13, fontWeight:600 }}>{message}</div>
          {sub && <div style={{ color:"var(--text-mid)", fontSize:11, marginTop:4, lineHeight:1.4 }}>{sub}</div>}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-dim)", cursor:"pointer", padding:0 }}>
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0,
        background:"radial-gradient(ellipse 80% 60% at 20% 40%,rgba(30,20,80,0.4) 0%,transparent 70%),radial-gradient(ellipse 60% 80% at 80% 60%,rgba(10,10,60,0.5) 0%,transparent 70%),var(--bg-void)" }} />
      <div style={{ position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(79,140,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,140,255,0.04) 1px,transparent 1px)",
        backgroundSize:"60px 60px" }} />
      <div style={{ position:"absolute", left:0, right:0, height:2,
        background:"linear-gradient(90deg,transparent,rgba(79,140,255,0.15),transparent)",
        animation:"scan-line 8s linear infinite" }} />
      {[...Array(12)].map((_,i) => (
        <div key={i} style={{ position:"absolute", left:`${5+(i*7)%90}%`, bottom:`-${10+(i*13)%30}%`,
          width:`${1+(i%3)}px`, height:`${1+(i%3)}px`, borderRadius:"50%", opacity:0,
          background: i%3===0?"var(--purple-core)":i%3===1?"var(--blue-core)":"var(--cyan-core)",
          animation:`float-particles ${8+(i*2.3)%10}s ${(i*1.1)%5}s linear infinite` }} />
      ))}
    </div>
  );
}

function StatRadar({ stats }) {
  const cx=90,cy=90,r=70,n=stats.length;
  const toXY=(i,v)=>{const a=(i/n)*2*Math.PI-Math.PI/2,norm=v/100;return[cx+r*norm*Math.cos(a),cy+r*norm*Math.sin(a)];};
  const gridPts=(l)=>stats.map((_,i)=>{const a=(i/n)*2*Math.PI-Math.PI/2;return`${cx+r*l*Math.cos(a)},${cy+r*l*Math.sin(a)}`;}).join(" ");
  const dataPts=stats.map((s,i)=>toXY(i,s.value).join(",")).join(" ");
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      {[0.25,0.5,0.75,1].map(l=><polygon key={l} points={gridPts(l)} fill="none" stroke="rgba(79,140,255,0.12)" strokeWidth="1"/>)}
      {stats.map((_,i)=>{const a=(i/n)*2*Math.PI-Math.PI/2;return<line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="rgba(79,140,255,0.12)" strokeWidth="1"/>;} )}
      <polygon points={dataPts} fill="rgba(79,140,255,0.15)" stroke="rgba(79,140,255,0.8)" strokeWidth="1.5"/>
      {stats.map((s,i)=>{const[x,y]=toXY(i,s.value);return<circle key={i} cx={x} cy={y} r={3} fill={s.color} style={{filter:`drop-shadow(0 0 4px ${s.color})`}}/>;} )}
      {stats.map((s,i)=>{const a=(i/n)*2*Math.PI-Math.PI/2;const lx=cx+(r+16)*Math.cos(a);const ly=cy+(r+16)*Math.sin(a);return(
        <text key={i} x={lx} y={ly+4} textAnchor="middle" fill={s.color} fontSize="9" fontFamily="Orbitron,monospace" fontWeight="700"
          style={{filter:`drop-shadow(0 0 4px ${s.color}77)`}}>{s.key}</text>);})}
    </svg>
  );
}

function WeeklyChart({ weeklyProgress }) {
  const max = Math.max(...weeklyProgress.map(d => d.done), 1);
  const days = ["D","S","T","Q","Q","S","S"];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:60, padding:"0 4px" }}>
      {weeklyProgress.map((d, i) => {
        const barH = Math.max(4, Math.round((d.done / max) * 52));
        const isToday = d.date === todayKey();
        const color = d.pct >= 60 ? "#00ff88" : d.pct >= 30 ? "#ffd700" : "var(--blue-dim)";
        return (
          <div key={d.date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ width:"100%", height:52, display:"flex", alignItems:"flex-end" }}>
              <div style={{ width:"100%", height:barH, borderRadius:"2px 2px 0 0", background:color,
                boxShadow: isToday ? `0 0 8px ${color}` : "none",
                opacity: isToday ? 1 : 0.7, transition:"height 0.6s ease" }} />
            </div>
            <span style={{ fontSize:8, fontFamily:"var(--font-mono)", color: isToday?"var(--text-bright)":"var(--text-dim)" }}>
              {days[new Date(d.date + "T12:00:00").getDay()]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Avatar({ profile, size = 64, editable = false, onEdit }) {
  const initials = (profile.name || "C").slice(0, 2).toUpperCase();
  const inputRef = React.useRef();
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}
      onClick={editable ? () => inputRef.current?.click() : undefined}
      style={{ position:"relative", width:size, height:size, flexShrink:0, cursor: editable?"pointer":"default" }}>
      {profile.avatar
        ? <img src={profile.avatar} alt="avatar"
            style={{ width:size, height:size, borderRadius:4, objectFit:"cover",
              border:"1px solid rgba(155,93,229,0.4)", boxShadow:"0 0 20px rgba(155,93,229,0.25)" }} />
        : <div style={{ width:size, height:size, borderRadius:4,
            background:"linear-gradient(135deg,#0a0a2a,#1a1040)",
            border:"1px solid rgba(155,93,229,0.4)", boxShadow:"0 0 20px rgba(155,93,229,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--purple-glow)", fontFamily:"var(--font-title)", fontSize:size*0.3, fontWeight:700 }}>
            {initials}
          </div>}
      {editable && (
        <>
          <div style={{ position:"absolute", inset:0, borderRadius:4, background:"rgba(0,0,0,0.5)",
            display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}>
            <Icon name="camera" size={size*0.3} color="white" />
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onEdit} />
        </>
      )}
    </div>
  );
}
