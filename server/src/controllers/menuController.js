const menuService = require('../services/menuService');

const getMenu = async (req, res, next) => {
  try {
    const menu = await menuService.getMenu();
    res.json(menu);
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const item = await menuService.createItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await menuService.updateItem(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await menuService.deleteItem(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getMenu, createItem, updateItem, deleteItem };
