import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import ProjectCreationScreen from './screens/ProjectCreationScreen';
import ProjectsListScreen from './screens/ProjectsListScreen';
import AddPodcastScreen from './screens/AddPodcastScreen';
import EditTranscriptScreen from './screens/EditTranscriptScreen';
import UploadDetailsScreen from './screens/UploadDetailsScreen';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/create-project" element={<ProjectCreationScreen />} />
          <Route path="/projects" element={<ProjectsListScreen />} />
          <Route path="/projects/:projectId/add-podcast" element={<AddPodcastScreen />} />
          <Route path="/projects/:projectId/uploads/:uploadId" element={<UploadDetailsScreen />} />
          <Route path="/projects/:projectId/uploads/:uploadId/edit-transcript" element={<EditTranscriptScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
