import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const ELEMENTS_PER_PAGE = 30;

export default class SortableTable {
  element;
  data;
  subElements = {};
  fetching;

  constructor(headersConfig, {
    url = '',
    isSortLocally = false,
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.id = sorted?.id;
    this.order = sorted?.order;

    this.render();
  }

  renderTable = () => {
    return `
      <div class="sortable-table">
        ${this.renderHeader()}
        ${this.renderData()}
      </div>
    `;
  }

  renderHeader = () => {
    return (`
      <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(({id, title, sortable}) => {
      return (`
          <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
            <span>${title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>
          </div>
        `);
    }).join('')}
      </div>
    `);
  }

  renderData = () => {
    if (this.data && this.data.length !== 0) {
      return (`${this.renderRows(this.data)}`);
    }

    if (this.data && this.data.length === 0) {
      return (`
      <div data-element="body" class="sortable-table__body">
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `);
    }

    return (`
      <div data-element="body" class="sortable-table__body">
        ${this.renderLoading()}
      </div>
      `);
  }

  renderRows = (data) => {
    return data.map(elem => {
      return (`
      <a href="/products/${elem.id}" class="sortable-table__row">
        ${this.renderRow(elem)}
      </a>
      `);
    }).join('');
  }

  renderRow = (data) => {
    const cells = this.headerConfig.map(({id, template}) => {
      return {id, template};
    });

    return cells.map(({id, template}) => {
      return template ? template(data[id]) : `<div class="sortable-table__cell">${data[id]}</div>`;
    }).join('');
  }

  renderLoading = () => {
    return `
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    `;
  }

  getData = async ({sort = '', order = 'asc', start = 0, end = ELEMENTS_PER_PAGE} = {}) => {
    try {
      const query = new URLSearchParams();
      query.append('_sort', sort);
      query.append('_order', order);
      query.append('_start', start);
      query.append('_end', end);

      const resp = await fetchJson(`${BACKEND_URL}/${this.url}?${query.toString()}`);

      return resp;
    } catch (e) {
      console.error(e);
    }
  }

  sortOnClient = (id, order) => {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === id);
    const {sortType} = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], ['ru', 'en']);
      default:
        return direction * (a[id] - b[id]);
      }
    });
  }

  sortOnServer = async (id, order) => {
    return await this.getData({sort: id, order});
  }

  sort = async (field, order) => {
    this.id = field;
    this.order = order;

    const sortedData = this.isSortLocally ? this.sortOnClient(field, order) : await this.sortOnServer(field, order);

    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    allColumns.forEach(element => {
      element.dataset.order = '';
    });

    currColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.renderRows(sortedData);
  }

  appendDataOnScroll = () => {
    const isBottom = window.pageYOffset > Math.abs(document.body.scrollHeight - window.innerHeight);

    if (isBottom) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.renderLoading();
      const element = wrapper.firstElementChild;

      this.subElements.body.append(element);

      const currElementsCount = this.data.length;

      this.getData({sort: this.id, order: this.order, start: currElementsCount, end: currElementsCount + ELEMENTS_PER_PAGE}).then(resp => {
        element.remove();

        this.data.push(...resp);

        const dataWrapper = document.createElement('div');
        dataWrapper.innerHTML = this.renderRows(resp);
        const elementData = dataWrapper.children;

        this.subElements.body.append(...elementData);
      });
    }
  }

  getSubElements = (element) => {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  handleHeaderClick = (event) => {
    const header = event.target.closest('[data-sortable="true"]');

    if (!header) {return;}

    const reverseOrder = header.dataset.order === 'desc' ? 'asc' : 'desc';

    this.sort(header.dataset.id, reverseOrder);
  }

  handleScroll = () => {
    // Debounce example from https://bencentra.com/code/2015/02/27/optimizing-window-resize.html

    // clear the timeout
    clearTimeout(this.fetching);
    // start timing for event "completion"
    this.fetching = setTimeout(this.appendDataOnScroll, 250);
  }

  remove = () => {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy = () => {
    this.remove();
    this.element = null;
    this.subElements = {};
    
    window.removeEventListener('scroll', this.handleScroll);
  }

  render = () => {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.renderTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const headers = element.querySelectorAll('[data-sortable="true"]');

    for (const header of headers) {
      header.addEventListener('pointerdown', this.handleHeaderClick, true);
    }

    window.addEventListener('scroll', this.handleScroll, { passive: true });

    return this.getData().then(resp => {
      this.data = resp;
      
      this.subElements.body.innerHTML = this.renderData();

      if (this.isSortLocally) {
        this.sort(this.id, this.order);
      }
    });
  }
}
