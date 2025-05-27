import "bootstrap/dist/css/bootstrap.min.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AccountInfo from "./components/AccountInfo";
import ActivityDetail from "./components/ActivityDetail";
import ClubDetail from "./components/ClubDetail";
import ClubList from "./components/ClubList";
import Header from "./components/Header";
import MyClubs from "./components/MyClubs";

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
            <Route path="/account" element={<AccountInfo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
