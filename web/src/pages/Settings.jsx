import React from "react";
export default function Settings(){
  function resetAll(){
    if(!confirm("Reset local data (profiles, active profile)?")) return;
    localStorage.removeItem("alluvo_profiles"); localStorage.removeItem("alluvo_activeProfile");
    location.reload();
  }
  return(<div className="page"><h2>Settings</h2><button className="btn danger" onClick={resetAll}>Reset local data</button></div>);
}
