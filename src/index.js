import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {Route, Switch} from 'react-router';
import './index.css';
import Main from './Main';
import Dashboard from './Dashboard';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={Main} />
        </Switch>
    </BrowserRouter>
, document.getElementById('root'));
registerServiceWorker();
