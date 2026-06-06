const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, toggleUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/toggle', toggleUser);
router.delete('/:id', deleteUser);

module.exports = router;
