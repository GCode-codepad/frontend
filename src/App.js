import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import CollaborativeEditor from "./components/CollaborativeEditor";
import Home from "./components/Home";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<CollaborativeEditor/>} />
      </Routes>
  );
}

export default App;
