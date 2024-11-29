import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import CodeEnv from "./screens/CodeEnv";
import ProjectSelectScree from "./screens/projectSelectScree";
import ProjectCardsScreen from "./screens/projectCardsScreen";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<ProjectSelectScree />} />
          <Route path="/codeEnv" element={<CodeEnv />} />
          <Route path="/projectCards" element={<ProjectCardsScreen />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
