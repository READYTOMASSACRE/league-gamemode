import React from 'react';
import './App.css';
import WeaponDialog from '../WeaponDialog/WeaponDialog';
import ScoreboardData from '../Scoreboard/ScoreboardData';
import InfoPanelWrapper from '../InfoPanel/InfoPanelWrapper';
import NotifyNotistack from '../Notify/NotifyNotistack';
import GameMenu from '../GameMenu/GameMenu';
import DeathlogList from '../Deathlog/DeathlogList';
import Effects from '../Effects/Effects';
import Spectate from '../Spectate/Spectate';
import MainControls from '../Common/MainControls';
import MapEditor from '../MapEditor/MapEditor';

function App() {
  return (
    <div className="App">
      <InfoPanelWrapper />
      <DeathlogList />
      <main className="App-header">
        <Effects />
        <WeaponDialog />
        <ScoreboardData />
        <NotifyNotistack />
        <GameMenu />
        <Spectate />
        <MainControls />
        <MapEditor />
      </main>
    </div>
  );
}

export default App;
