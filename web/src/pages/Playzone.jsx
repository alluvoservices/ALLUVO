import React, { useState } from "react";

export default function Playzone() {
  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Playzone</h2>
      <div className="section-title">Mini Games</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TicTacToe />
        <Snake />
      </div>
    </div>
  );
}

function TicTacToe() {
  const [b, setB] = useState(Array(9).fill(null));
  const [x, setX] = useState(true);
  const w = winner(b);
  function click(i) {
    if (b[i] || w) return;
    const nb = b.slice(); nb[i] = x ? "X" : "O";
    setB(nb); setX(!x);
  }
  function reset(){ setB(Array(9).fill(null)); setX(true); }
  return (
    <div className="page">
      <div style={{ marginBottom: 8, fontWeight: 700 }}>Tic-Tac-Toe {w ? `— ${w} wins` : `— Turn: ${x?"X":"O"}`}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 56px)" }}>
        {b.map((v,i)=>(<button key={i} onClick={()=>click(i)} style={{height:56,border:"1px solid #2b3c66",background:"#0f1628",color:"#fff",fontSize:20}}>{v||""}</button>))}
      </div>
      <button className="btn" onClick={reset} style={{ marginTop: 8 }}>Reset</button>
    </div>
  );
}
function winner(b){
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,c,d] of L) if (b[a]&&b[a]===b[c]&&b[c]===b[d]) return b[a]; return null;
}

function Snake() {
  const [score, setScore] = useState(0);
  return (
    <div className="page">
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Snake (placeholder)</div>
      <div style={{ color: "#9fb0cc" }}>This block is a placeholder. We can plug more open-source HTML5 games later.</div>
      <div style={{ marginTop: 8 }}>Score: {score}</div>
    </div>
  );
}
