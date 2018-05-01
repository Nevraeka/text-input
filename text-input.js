(function (document, window) {

  const customElementsExist = !!window.customElements;

  if (!document.getElementById('#wc-polyfill') && !customElementsExist) {
    const script = document.createElement('script');
    script.id = 'wc-polyfill';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.2.0/webcomponents-sd-ce.js';
    document.head.appendChild(script);
  }

  function loadComponent() {
    if (!customElementsExist) {
      setTimeout(loadComponent, 0);
    } else {
      if (!!!window.customElements.get('img-icon')) {
        const scrpt = document.createElement('script');
        scrpt.src = 'https://cdn.rawgit.com/Nevraeka/img-icon/master/img-icon.js'
        document.head.appendChild(scrpt);
      }

      window.customElements.whenDefined('img-icon').then(() => {
        
        if (!(!!window.customElements.get('text-input'))) {
          window.customElements.define('text-input',
            class TextInput extends HTMLElement {

              static get observedAttributes() { return ['is-valid', 'placeholder', 'size']; }

              constructor() {
                super();
                this._root = null;
                this._state = {
                  placeholder: '',
                  size: 'large',
                  text: ''
                };
              }

              connectedCallback() {
                if (this._root === null) {
                  if (!!this.attachShadow) {
                    this._root = this.attachShadow({ mode: "open" });
                  } else {
                    this._root = this;
                  }
                }
                const initVal = this.getAttribute('initial-value');
                if (!!initVal) { this._state.text = initVal; }
                render(this);
              }

              attributeChangedCallback(name, oldValue, newValue) {
                if (newValue === oldValue) { return };
                if (name === 'placeholder') { this._state.placeholder = newValue; }
                if (name === 'size') { this._state.size = newValue; }
                if (name === 'is-valid') {
                  if (newValue === 'true' || newValue === 'false') { this._state.isValid = newValue; }
                }
                render(this);
              }

            });
            function render(component) {
              if (!!component._root) {
                const setPlaceholderAttr = !!component._state.placeholder ?
                  'placeholder="' + component._state.placeholder + '"' : '';

                let setValidationClass = '';
                let iconShape = '';
                let iconDisplay = 'none';
                let iconFill = 'currentColor';

                if (component._state.isValid === 'true') {
                  setValidationClass = 'is-valid';
                  iconShape = 'checkmark';
                  iconDisplay = 'block';
                  iconFill = '#7dc243';
                }

                if (component._state.isValid === 'false') {
                  setValidationClass = 'not-valid';
                  iconShape = 'alertCircle'
                  iconDisplay = 'block';
                  iconFill = '#f44336';
                }

                component._root.innerHTML = `
                  <style>
                    :host {
                      font-family: 'Roboto', Arial, sans-serif;
                      max-width: 100%;
                    }
                    .text__input_wrapper {
                      position: relative;
                    }
                    .text__input {
                      border-radius: 6px;
                      padding: 16px 16px 14px 16px;
                      font-size: 16px;
                      line-height: 24px;
                      border: 1px solid #bdbdbd;
                      color: #424242;
                      background-color: #fff;
                      width: 100%;
                      max-width: 100%;
                      outline: none;
                      box-shadow: none;
                      transition: border-color 0.25s, width 0.2s;
                    }

                    .text__input_icon {
                      color: ${iconFill};
                      display: ${iconDisplay};
                      max-width: 24px;
                      max-height: 24px;
                      position: absolute;
                      left: calc(100% - 6px);
                      top: calc(50% - 12px);
                    }

                    .text__input.small {
                      padding: 11px 16px;
                    }

                    .text__input.disabled {
                      background-color: #eee;
                      border-color: #bdbdbd;
                      color: #bdbdbd;
                    }

                    .text__input:focus,
                    .text-input:hover {
                      border-color: #3777bc;
                    }

                    .not-valid {
                      border-color: #f44336;
                    }

                    [fallback] {
                      display: none;
                    }
                  </style>
                  <div class="text__input_wrapper">
                    <input ${setPlaceholderAttr} class="text__input ${setValidationClass} ${component._state.size}" type="text" />
                    <img-icon fill="100" class="text__input_icon" shape="${iconShape}"></img-icon>
                  </div>`;

                const textInput = component._root.querySelector('.text__input');
                const blurHandler = (evt) => blurEvent(component);
                textInput.setAttribute('value', component._state.text);
                textInput.removeEventListener('blur', blurHandler);
                textInput.addEventListener('blur', blurHandler);
              }
            }

            function blurEvent(component) {
              component._state.text = component._root.querySelector('.text__input').value;
              component.dispatchEvent(component.textUpdatedEvent(component));
            }

            function textUpdatedEvent(component) {
              return new CustomEvent('textUpdated', {
                bubbles: true,
                composed: true,
                detail: { text: component._state.text }
              });
            }
          }
        });

      }
    }
    loadComponent();

  })(document, window);