import { MainCalendar } from './Components/MainCalendar';
import { Helmet } from "react-helmet";


function App() {
  return (
    <div className="app">
      <Helmet>
        <title>Calendar Project</title>
      </Helmet>
      <MainCalendar />
    </div>
  );
}

export default App;