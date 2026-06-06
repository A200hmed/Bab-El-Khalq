const githubService = require('./githubService');
const { validateMenuItem } = require('../validators/menuValidator');
const logger = require('../utils/logger');

let cache = null;
let lastUpdated = null;
const CACHE_TTL = 5000; // 5 seconds cache

class MenuService {
  async getMenu() {
    const now = Date.now();
    
    if (cache && lastUpdated && now - lastUpdated < CACHE_TTL) {
      logger.debug('Returning menu from cache');
      return cache;
    }

    logger.debug('Fetching menu from GitHub');
    cache = await githubService.readMenu();
    lastUpdated = now;
    return cache;
  }

  async getMenuById(id) {
    const menu = await this.getMenu();
    return menu.find(item => item.id === id);
  }

  async createItem(itemData) {
    const { error, value } = validateMenuItem(itemData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const menu = await this.getMenu();
    const newItem = {
      ...value,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    menu.unshift(newItem);
    
    await githubService.writeMenu(menu, `Add item: ${newItem.name}`);
    cache = menu;
    lastUpdated = Date.now();
    
    return newItem;
  }

  async updateItem(id, itemData) {
    const { error, value } = validateMenuItem(itemData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const menu = await this.getMenu();
    const index = menu.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }

    menu[index] = {
      ...menu[index],
      ...value,
      updatedAt: new Date().toISOString(),
    };

    await githubService.writeMenu(menu, `Update item: ${menu[index].name}`);
    cache = menu;
    lastUpdated = Date.now();

    return menu[index];
  }

  async deleteItem(id) {
    const menu = await this.getMenu();
    const index = menu.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }

    const deletedItem = menu.splice(index, 1)[0];
    await githubService.writeMenu(menu, `Delete item: ${deletedItem.name}`);
    cache = menu;
    lastUpdated = Date.now();

    return true;
  }
}

module.exports = new MenuService();
