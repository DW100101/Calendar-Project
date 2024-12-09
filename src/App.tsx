import { useEffect } from 'react';
import { MainCalendar } from './Components/MainCalendar';

function App() {
  
    useEffect(() => {
      document.title = "Calendar Project";
    }, []);
    return (
    <div className="App">
      <MainCalendar />
    </div>
  );
}

export default App;