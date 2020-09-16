import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AppLayout from '../layouts/AppLayout';

// Pages
import HomePage from './HomePage';
import ChallengeListPage from './challengeList/ChallengeListPage';
import SignupPage from './auth/SignupPage';
import SigninPage from './auth/SigninPage';
import ChallengeQueuePage from './challenge/ChallengeQueuePage';
import ChallengePage from './challenge/ChallengePage';
import SettingsPage from './settings/SettingsPage';
import InvitePage from './challenge/InvitePage';
import RecoveryPage from './auth/RecoveryPage';
import NotFoundPage from './NotFoundPage';
import GithubRegisterPage from './auth/GithubRegisterPage';
import RoadmapPage from './roadmap/RoadmapPage';

const appRoutes = [
  {
    path: '/challenges',
    component: ChallengeListPage,
  },
  {
    path: '/c/:cId',
    exact: true,
    component: ChallengeQueuePage,
  },
  {
    path: '/c/:cId/r/:rId',
    component: ChallengePage,
  },
  {
    path: '/settings/:type?',
    component: SettingsPage,
  },
];

const landingRoutes = [
  {
    path: '/',
    exact: true,
    component: HomePage,
  },
  {
    path: '/signup',
    component: SignupPage,
  },
  {
    path: '/signin',
    component: SigninPage,
  },
  {
    path: '/recovery',
    component: RecoveryPage,
  },
  {
    path: '/account/register',
    component: GithubRegisterPage,
  },
  {
    path: '/roadmap',
    component: RoadmapPage,
  },
];

const Root = () => (
  <Router>
    <Switch>
      {landingRoutes.map(({ path, exact, component: Comp }) => (
        <Route
          path={path}
          exact={exact}
          key={path}
          render={(props) => (
            <MainLayout {...props}>
              <Comp {...props} />
            </MainLayout>
          )}
        />
      ))}

      {appRoutes.map(({ path, exact, component: Comp }) => (
        <Route
          path={path}
          exact={exact}
          key={path}
          render={(props) => (
            <AppLayout {...props}>
              <Comp {...props} />
            </AppLayout>
          )}
        />
      ))}

      <Route path="/invite/:key" component={InvitePage} />
      <Route component={NotFoundPage} />
    </Switch>
  </Router>
);

export default Root;
