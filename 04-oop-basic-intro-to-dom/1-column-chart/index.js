export default class ColumnChart {
    chartHeight = 50;

    constructor (props) {
      this.data = [];
      this.label = '';
      this.value = 0;
      this.link = '#';

      if (props) {
        const {data = [], label = '', value = 0, link = '#', formatHeading} = props;

        this.data = data;
        this.label = label;
        this.value = formatHeading ? formatHeading(value) : value;
        this.link = link;
      }
    
      this.render();
    }

    getColumnProps() {
      const maxValue = Math.max(...this.data);
      const scale = this.chartHeight / maxValue;
      
      return this.data.map(item => {
        return {
          percent: (item / maxValue * 100).toFixed(0) + '%',
          value: String(Math.floor(item * scale))
        };
      });
    }

    renderCard (data) {
      return `
        <div class="column-chart__title">
            ${this.label}
            <a class="column-chart__link" href="${this.link}">View all</a>
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
                ${this.value}
            </div>
            <div data-element="body" class="column-chart__chart">
                ${data}
            </div>
        </div>
      `;
    }

    renderPreloader () {
      return this.renderCard('<img src="./charts-skeleton.svg" alt="loading-charts"></img>');
    }

    renderData () {
      return this.renderCard(this.getColumnProps().map(({percent, value}) => {
        return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
      }).join(''));
    }

    update (data) {
      this.data = data;
      this.render();
    }

    remove () {
      this.element.remove();
    }

    destroy () {
      this.element.remove();
    }

    render () {
      const wrapper = document.createElement('div');

      if (this.data.length) {
        wrapper.className = 'column-chart';
        wrapper.style = `--chart-height: ${this.chartHeight}`;

        wrapper.innerHTML = this.renderData();
      } else {
        wrapper.className = 'column-chart column-chart_loading';
        wrapper.style = `--chart-height: ${this.chartHeight}`;

        wrapper.innerHTML = this.renderPreloader();
      }

      this.element = wrapper;
    }
}
