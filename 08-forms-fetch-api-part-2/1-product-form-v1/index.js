import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element
  subElements = {}
  product = {}
  categories = {}

  constructor (productId) {
    this.productId = productId;
  }

  renderImages = () => {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"><ul class="sortable-list">${this.productId ? this.product.images.map(image => this.renderImage(image)).join('') : ''}</ul></div>
        <button data-element="uploadButton" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
    `;
  }

  renderImage = (image) => {
    return `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${image.url}">
      <input type="hidden" name="source" value="${image.source}">
      <span>
    <img src="icon-grab.svg" data-grab-handle="" alt="grab">
    <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
    <span>${image.source}</span>
  </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button></li>
    `;
  }

  renderCategories = () => {
    const categories = this.categories.reduce((prevCat, cat) => {
      return [
        ...prevCat,
        ...cat.subcategories.reduce((prevSubcat, subcat) => {
          return [...prevSubcat, {
            id: subcat.id,
            label: `${cat.title} > ${subcat.title}`
          }];
        }, [])
      ];
    }, []);

    return `
    <div class="form-group form-group__half_left">
      <label class="form-label">Категория</label>
      <select class="form-control" id="subcategory" name="subcategory">
      ${categories.map(elem => {
      return (`
      <option value="${elem.id}" ${elem.id === this.product.subcategory && 'selected'}>${elem.label}</option>
        `);
    }).join('')}
        </select>
      </div>
      `;
  }

  renderForm = () => {
    const {title = '', price, quantity, status, discount} = this.product;

    return `
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара" value="${escapeHtml(title)}">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" id="description" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      ${this.renderImages()}
      ${this.renderCategories()}
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" id="price" type="number" name="price" class="form-control" placeholder="100" value="${price}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" id="discount" type="number" name="discount" class="form-control" placeholder="0" value="${discount}">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" id="quantity" type="number" class="form-control" name="quantity" placeholder="1" value="${quantity}">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status" value=${status}>
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          ${this.productId ? 'Сохранить товар' : 'Добавить товар'}
        </button>
      </div>
      <input data-element="file-input" type="file" style="display: none;" />
    </form>
    `;
  }

  fillForm = () => {
    const {productDescription} = this.subElements;

    productDescription.value = escapeHtml(this.product.description);
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

  uploadImage = async (event) => {
    const uploadButton = this.subElements.uploadButton;

    uploadButton.disabled = true;
    uploadButton.classList.add('is-loading');

    const file = event.target.files[0];

    const formData = new FormData();
    formData.append('image', file);

    try {
      const resp = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          "authorization": `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData
      });

      const wrapper = document.createElement('div');

      wrapper.innerHTML = this.renderImage({url: resp.data.link, source: file.name});

      this.subElements.imageListContainer.append(wrapper.firstElementChild);

      uploadButton.disabled = false;
      uploadButton.classList.remove('is-loading');
    } catch (error) {
      console.error(error);

      uploadButton.disabled = false;
      uploadButton.classList.remove('is-loading');
    }
  }

  save = async () => {
    const formData = new FormData(this.element);

    try {
      const response = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        body: formData
      });

      this.element.dispatchEvent(new CustomEvent(this.productId ? "product-updated" : "product-saved", {
        detail: response
      }));
    } catch (error) {
      console.error(error);
    }
    
  }

  render = async () => {
    try {
      const requests = [];

      requests.push(fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`));

      if (this.productId) {
        requests.push(fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`));
      }

      const [categories, product] = await Promise.all(requests);

      this.categories = categories;
      if (product) {
        this.product = product[0];
      }

      const wrapper = document.createElement('div');

      wrapper.innerHTML = this.renderForm();

      const element = wrapper.firstElementChild;

      this.element = element;
      this.subElements = this.getSubElements(wrapper);

      this.element.onsubmit = this.save;

      this.subElements.uploadButton.onclick = () => this.subElements["file-input"].click();
      this.subElements["file-input"].addEventListener('change', this.uploadImage);

      if (this.productId) {
        this.fillForm();
      }

      return this.element;
    } catch (e) {
      console.error(e);
    }
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
  }
}
