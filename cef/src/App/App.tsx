import React from 'react';
import './App.css';
import WeaponDialog from '../WeaponDialog/WeaponDialog';
import ScoreboardData from '../Scoreboard/ScoreboardData';
import InfoPanelWrapper from '../InfoPanel/InfoPanelWrapper';
import NotifyNotistack from '../Notify/NotifyNotistack';

function App() {
  return (
    <div className="App">
      <InfoPanelWrapper />
      <main className="App-header">
        <WeaponDialog />
        <ScoreboardData />
        <NotifyNotistack />
      </main>
    </div>
  );
}

export default App;
