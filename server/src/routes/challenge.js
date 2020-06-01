const router = require('express').Router();
const bodyParser = require('body-parser');
const challengeController = require('../controllers/challenge');
const { requireAuth } = require('../controllers/authentication');

const jsonParser = bodyParser.json();
router.post(
  '/challenge/create',
  jsonParser,
  challengeController.createChallenge
);
router.get('/challenge/list', challengeController.getChallengeList);

router.post(
  '/challenge/:id/create',
  requireAuth,
  challengeController.createPrivateRoom
);

// Routes for challenge room
router.get(
  '/challenge/:cId/room/:rId',
  requireAuth,
  challengeController.getRoomInfo
);

router.post(
  '/challenge/:cId/room/:rId/test',
  requireAuth,
  jsonParser,
  challengeController.testSolution
);

router.post(
  '/room/:rId/public',
  requireAuth,
  challengeController.convertRoomToPublic
);

router.post(
  '/invite/:key',
  requireAuth,
  jsonParser,
  challengeController.joinRoomByInvite
);

module.exports = router;
