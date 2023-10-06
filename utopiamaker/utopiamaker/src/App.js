import { createContext, useState} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './public/css/App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/404';

export const UserContext = createContext({
    userData: null,
    setUserData: () => {},
});

export const ProjectsContext = createContext({
    projectsData: null,
    setProjectsData: () => {},
});

function App() {
    
    const [user, setUser] = useState({
        id: null,
        name: null,
        email: null,
        pass: null,
        projectsCreator: [],
        projectsContributor: [],
        projectsValidator: [],
    })

    const [projects, setProjects] = useState({
        projectsCreator: [],
        projectsContributor: [],
        projectsValidator: [],
    })

    return(<>
        <UserContext.Provider value={{user, setUser}}>
            <ProjectsContext.Provider value={{projects, setProjects}}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login/>}/>
                        <Route path="/dashboard/*" element={<Dashboard/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
            </ProjectsContext.Provider>
        </UserContext.Provider>
    </>);
}

export default App;
