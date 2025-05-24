import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ClubList from "./components/ClubList";
import MyClubs from "./components/MyClubs";
import ClubDetail from "./components/ClubDetail";
import ActivityDetail from "./components/ActivityDetail";
import Header from "./components/Header";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="container-fluid p-0">
        <Header />
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<ClubList />} />
            <Route path="/my-clubs" element={<MyClubs />} />
            <Route path="/clubs/:id" element={<ClubDetail />} />
            <Route
              path="/clubs/:clubId/activities/:id"
              element={<ActivityDetail />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
