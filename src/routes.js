const express = require('express');
const SessionController = require('./controllers/SessionController');
const MestreController = require('./controllers/MestreController');
const VisitController = require('./controllers/VisitController');
const AdminController = require('./controllers/AdminController');

const authenticate = require('./authenticate');

const routes = express.Router();
const routesMestre = express.Router();

const authMiddleware = require("./middlewares/auth")

routes.post('/sessions', SessionController.store);
routes.get('/sessions', authMiddleware, SessionController.index);
routes.get('/sessions', authMiddleware, SessionController.show);

routes.put('/mestre', authMiddleware, MestreController.update);
routes.get('/mestre', authMiddleware, MestreController.index);

routes.post('/authenticate', authenticate.authenticate);
routes.post('/authenticateAdmin', authenticate.authenticateAdmin);

routes.post('/schedule', authMiddleware, VisitController.store);
routes.get('/schedule', authMiddleware, VisitController.index);
routes.get('/schedule/:month', authMiddleware, VisitController.showMonth);
routes.get('/availableHours/', authMiddleware, VisitController.showAvalibleHours);
routes.put('/rescheduling', authMiddleware, VisitController.rescheduling);
routes.get('/visit/:id', authMiddleware, VisitController.show);
routes.delete('/deleteVisit/:id', authMiddleware, VisitController.destroy);

routes.post('/admin', AdminController.store);
routes.get('/admin', authMiddleware, AdminController.index);

module.exports = routes;
