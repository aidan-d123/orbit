// components
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

// pages
import Profile from './pages/profile/Profile';
import Project from './pages/project/Project';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className='container'>
          <Switch>
            <Route exact path="/">
              <Redirect to="project/new" />
            </Route>
            <Route path="/project/:id">
              <Project />
            </Route>
            <Route path="/profile/:id">
              <Profile />
            </Route>
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
