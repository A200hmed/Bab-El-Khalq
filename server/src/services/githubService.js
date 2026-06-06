const { octokit, owner, repo, branch, filePath } = require('../config/github');
const logger = require('../utils/logger');

class GitHubService {
  async getFileSHA() {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      });
      return data.sha;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      logger.error('Error getting file SHA:', error);
      throw error;
    }
  }

  async readMenu() {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      });

      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    } catch (error) {
      logger.error('Error reading menu from GitHub:', error);
      throw error;
    }
  }

  async writeMenu(menu, message) {
    try {
      const sha = await this.getFileSHA();
      const content = JSON.stringify(menu, null, 2);
      
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: message || 'Update menu',
        content: Buffer.from(content).toString('base64'),
        sha: sha,
        branch: branch,
      });

      logger.info('Menu updated successfully on GitHub');
      return data;
    } catch (error) {
      logger.error('Error writing menu to GitHub:', error);
      throw error;
    }
  }
}

module.exports = new GitHubService();
