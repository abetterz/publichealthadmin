const axios = require("axios");
const cheerio = require("cheerio");

class Scraper {
  constructor(url) {
    this.url = url;
  }
  async fetchHTML() {
    const { data } = await axios.get(this.url);
    return cheerio.load(data);
  }
  async getHtml() {
    const $ = await this.fetchHTML();
    return $;
  }
}

module.exports = Scraper;
