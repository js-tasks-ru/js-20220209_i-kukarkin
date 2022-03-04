export default class SortableTable {
  element;
  subElements = {};

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;

    this.render();
    this.sort(sorted.id, sorted.order);
  }

  renderTable () {
    return `
      <div class="sortable-table">
      ${this.renderHeader()}
      ${this.renderData()}
      </div>
    `;
  }

  renderHeader () {
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

  renderData () {
    return (`
      <div data-element="body" class="sortable-table__body">
      ${this.renderRows(this.data)}
      </div>
    `);
  }

  renderRows (data) {
    return data.map(elem => {
      return (`
      <a href="/products/${elem.id}" class="sortable-table__row">
        ${this.renderRow(elem)}
      </a>
      `);
    }).join('');
  }

  renderRow (data) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {id, template};
    });

    return cells.map(({id, template}) => {
      return template ? template(data[id]) : `<div class="sortable-table__cell">${data[id]}</div>`;
    }).join('');
  }

  sort (field, order) {
    const sortedData = this.sortData(field, order);

    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    allColumns.forEach(element => {
      element.dataset.order = '';
    });

    currColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.renderRows(sortedData);
  }

  sortData (field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const {sortType} = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  getSubElements (element) {
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

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = {};    
  }

  render () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.renderTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const headers = element.querySelectorAll('[data-sortable="true"]');

    for (const header of headers) {
      header.addEventListener('pointerdown', this.handleHeaderClick, true);
    }
  }
}
