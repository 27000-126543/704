import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskBoard from './pages/TaskBoard';
import NewTask from './pages/NewTask';
import TaskDetail from './pages/TaskDetail';
import Simulation from './pages/Simulation';
import SimulationDetail from './pages/SimulationDetail';
import Monitor from './pages/Monitor';
import Review from './pages/Review';
import Reports from './pages/Reports';
import Recommend from './pages/Recommend';
import Approval from './pages/Approval';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/board" element={<TaskBoard />} />
          <Route path="/tasks/new" element={<NewTask />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/simulation/:id" element={<SimulationDetail />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/review" element={<Review />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
