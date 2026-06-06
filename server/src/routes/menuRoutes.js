const express = require('express');
const { getMenu, createItem, updateItem, deleteItem } = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', getMenu);
router.post('/', authMiddleware, createItem);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
