import React from 'react';
import './App.css';
import WeaponDialog from '../WeaponDialog/WeaponDialog';
import ScoreboardData from '../Scoreboard/ScoreboardData';
import InfoPanelWrapper from '../InfoPanel/InfoPanelWrapper';
import NotifyNotistack from '../Notify/NotifyNotistack';
import GameMenu from '../GameMenu/GameMenu';
import DeathlogList from '../Deathlog/DeathlogList';

function App() {
  return (
    <div className="App">
      <InfoPanelWrapper />
      <DeathlogList />
      <main className="App-header">
        <WeaponDialog />
        <ScoreboardData />
        <NotifyNotistack />
        <GameMenu />
      </main>
    </div>
  );
}

export default App;
