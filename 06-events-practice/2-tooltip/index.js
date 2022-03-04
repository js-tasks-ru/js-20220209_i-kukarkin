let instance = null;

class Tooltip {
  element
  isVisible = false;

  constructor() {
    if (!instance) {
      instance = this;
    }

    return instance;
  }

  render = (event, tooltip) => {
    const {pageX, pageY} = event;

    if (this.element) {
      this.element.style = `position: absolute; top: ${pageY + 15}px; left: ${pageX + 15}px;`;

      this.element.firstElementChild.innerText = tooltip;

      document.body.append(this.element);
    } else {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = `<div style="position: absolute; top: ${pageY + 15}px; left: ${pageX + 15}px;"><div class="tooltip">${tooltip}</div>`;

      const element = wrapper.firstElementChild;

      this.element = element;

      document.body.append(element);
    }
  }

  pointeOverHandle = (event) => {
    const {tooltip} = event.target.dataset;

    if (tooltip) {
      this.isVisible = true;
      this.render(event, tooltip);
    }
  }

  pointerOutHandle = (event) => {
    const {tooltip} = event.target.dataset;

    if (tooltip) {
      this.isVisible = false;
      this.remove();
    }
  }

  pointerMoveHandle = (event) => {
    const {tooltip} = event.target.dataset;

    if (this.isVisible && tooltip) {
      this.render(event, tooltip);
    }
  }

  initialize () {
    document.addEventListener('pointerover', this.pointeOverHandle);

    document.addEventListener('pointerout', this.pointerOutHandle);

    document.addEventListener('pointermove', this.pointerMoveHandle);
  }

  remove () {
    if (this.element) {
      document.removeEventListener('pointerover', this.pointeOverHandle);

      document.removeEventListener('pointerout', this.pointerOutHandle);

      document.removeEventListener('pointermove', this.pointerMoveHandle);

      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = {};    
  }
}

export default Tooltip;
