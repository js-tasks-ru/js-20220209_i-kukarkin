import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element
  sortableTable
  ordersChart
  salesChart
  customersChart
  subElements = {}
  initialDate = {}

  constructor () {
    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 7);

    this.initialDate = {
      from: prevDate,
      to: new Date()
    };
  }

  renderRangePicker () {
    const {from, to} = this.initialDate;

    const rangePicker = new RangePicker({ from, to });

    this.subElements.rangePicker = rangePicker.element;

    return rangePicker.element;
  }

  renderCharts () {
    const {from, to} = this.initialDate;
    const wrapper = document.createElement('div');

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      label: 'Заказы',
      range: { from, to },
      link: '/sales'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'Продажи',
      range: { from, to },
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: { from, to },
      label: 'Клиенты',
    });

    wrapper.append(ordersChart.element);
    wrapper.append(salesChart.element);
    wrapper.append(customersChart.element);

    this.ordersChart = ordersChart;
    this.salesChart = salesChart;
    this.customersChart = customersChart;

    this.subElements.ordersChart = ordersChart.element;
    this.subElements.salesChart = salesChart.element;
    this.subElements.customersChart = customersChart.element;

    return wrapper.childNodes;
  }

  renderTable () {
    const {from, to} = this.initialDate;

    const table = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`
    });

    this.sortableTable = table;
    this.subElements.sortableTable = table.element;

    return table.element;
  }

  async renderDashboard () {
    const wrapper = document.createElement('div');
    wrapper.className = 'dashboard full-height flex-column';

    const topPanel = document.createElement('div');
    topPanel.className = 'content__top-panel';

    const header2 = document.createElement('h2');
    header2.className = 'page-title';
    header2.innerText = 'Панель управления';

    const charts = document.createElement('div');
    charts.className = 'dashboard__charts';

    const header3 = document.createElement('h3');
    header3.className = 'block-title';
    header3.innerText = 'Лидеры продаж';

    topPanel.append(header2);
    topPanel.append(this.renderRangePicker());

    charts.append(...this.renderCharts());

    wrapper.append(topPanel);
    wrapper.append(charts);
    wrapper.append(header3);
    wrapper.append(this.renderTable());
    
    return wrapper;
  }

  async render () {
    try {
      const wrapper = document.createElement('div');

      wrapper.append(await this.renderDashboard());

      const element = wrapper.firstElementChild;

      this.element = element;

      this.subElements.rangePicker.addEventListener('date-select', this.updateRange);

      return this.element;
    } catch (e) {
      console.error(e);
    }
  }

  updateRange = async (event) => {
    const { from, to } = event.detail;
    const { id, order } = this.sortableTable.sorted;
      
    this.sortableTable.data = [];
    this.sortableTable.url = new URL(`api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`, BACKEND_URL);
    const data = await this.sortableTable.loadData(id, order, 0, 30);
    this.sortableTable.update(data);

    this.ordersChart.loadData(from, to);
    this.salesChart.loadData(from, to);
    this.customersChart.loadData(from, to);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.initialDate = {};
  }
}
