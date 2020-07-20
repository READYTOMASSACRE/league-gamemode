import React from 'react';
import './App.css';
import WeaponDialog from '../WeaponDialog/WeaponDialog';
import ScoreboardData from '../Scoreboard/ScoreboardData';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <WeaponDialog />
        <ScoreboardData />
      </header>
    </div>
  );
}

export default App;
