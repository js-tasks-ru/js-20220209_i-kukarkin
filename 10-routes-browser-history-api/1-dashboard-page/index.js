import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element
  components = {}
  subElements = {}
  initialDate = {}

  constructor () {
    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 30);

    this.initialDate = {
      from: prevDate,
      to: new Date()
    };
  }

  initComponents () {
    const {from, to} = this.initialDate;

    const rangePicker = new RangePicker({ from, to });

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

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  get template () {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }


  renderPage () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  async render () {
    try {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = this.template;

      this.element = wrapper.firstElementChild;
      this.subElements = this.getSubElements(this.element);

      this.initComponents();
      this.renderPage();

      this.subElements.rangePicker.addEventListener('date-select', this.updateRange);

      return this.element;
    } catch (error) {
      console.error(error);
    }
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  updateRange = async (event) => {
    const { from, to } = event.detail;
      
    const url = new URL('api/dashboard/bestsellers', BACKEND_URL);

    url.searchParams.set(from, from.toISOString());
    url.searchParams.set(to, to.toISOString());
    url.searchParams.set('_start', '1');
    url.searchParams.set('_end', '30');
    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');

    const data = await fetchJson(url);
    this.components.sortableTable.update(data);

    this.components.ordersChart.loadData(from, to);
    this.components.salesChart.loadData(from, to);
    this.components.customersChart.loadData(from, to);
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
