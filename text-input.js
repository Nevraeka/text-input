(function (document, window) {

  if(!window.customElements ||!HTMLElement.prototype.attachShadow) {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.2.0/webcomponents-sd-ce.js', loadImgIcon )
  } else {
    if(!window.customElements.get('img-icon')) {
      loadImgIcon();
    } else {
      loadTextInput();
    }
  }

  function loadScript(url, callback){
      const script = document.createElement("script")
      script.type = "text/javascript";
      if (script.readyState){
          script.onreadystatechange = function(){
              if (script.readyState === "loaded" || script.readyState === "complete"){
                  script.onreadystatechange = null;
                  callback();
              }
          };
      } else {
          script.onload = function (){ callback() };
      }

      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
  }

  function loadImgIcon() {
    loadScript('https://cdn.rawgit.com/Nevraeka/img-icon/master/img-icon.js', loadTextInput);
  }

  function loadTextInput() {
    if (!!!window.customElements.get('text-input')) {
      window.customElements.define('text-input',
        class TextInput extends HTMLElement {

          static get observedAttributes() { return ['icon', 'is-valid', 'placeholder', 'size']; }

          constructor() {
            super();
            this._root = null;
            this._state = {
              icon: '',
              placeholder: '',
              size: 'large',
              text: ''
            };
          }

          get value(){
            return this._state.text;
          }

          set value(val){
            return this._state.text = val;
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
            if (name === 'icon') { this._state.icon = newValue; }
            if (name === 'is-valid') {
              if (newValue === 'true' || newValue === 'false') {
                this._state.isValid = newValue;
              } else {
                this._state.isValid = '';
              }
            }
            render(this);
          }
        }
      );
    }
  }

  function render(component) {
    if (!!component._root) {
      const setPlaceholderAttr = !!component._state.placeholder ? `placeholder="${component._state.placeholder}"` : '';
      const blurHandler = (evt) => blurEvent(component);
      const focusHandler = (evt) => focusEvent(component);

      let textInput = null;
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
          overflow: hidden;
          display: flex;
          width: 100%;
          max-width: 100%;
        }

        .text__input_wrapper {
          position: relative;
          font-family: 'Roboto', Arial, sans-serif;
          display: flex;
          max-width: 100%;
          width: 100%;
        }

        .text__input {
          background-color: #fff;
          transition: border-color 0.25s, width 0.2s;
          padding: 16px 16px 14px 16px;
          border-radius: 6px;
          border: 1px solid #bdbdbd;
          font-size: 16px;
          line-height: 24px;
          color: #424242;
          outline: none;
          width: 100%;
          max-width: 100%;
          box-shadow: none;
          background-color: rgba(255, 255, 255, 0);
        }

        .text__input_icon {
          display: ${iconDisplay};
          color: ${iconFill};
          background-color: #fff;
          max-width: 24px;
          max-height: 24px;
          position: absolute;
          right: 16px;
          top: calc(50% - 12px);
          z-index: 10;
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
        .text__input:hover {
          border-color: #3777bc;
        }

        .text__input.not-valid {
          border-color: #f44336;
        }

        .text__input_icon.is-valid,
        .text__input_icon.not-valid {
          display: block;
        }
        </style>
        <div class="text__input_wrapper">
          <input ${setPlaceholderAttr} class="text__input  ${component._state.size} ${setValidationClass}" type="text" />
          <img-icon fill="100" class="text__input_icon" shape="${component._state.isValid !== '' ? component._state.icon : iconShape}"></img-icon>
        </div>
      `;
 
      textInput = component._root.querySelector('.text__input');
      textInput.setAttribute('value', component._state.text);
      textInput.removeEventListener('focus', focusHandler);
      textInput.addEventListener('focus', focusHandler);
      textInput.removeEventListener('blur', blurHandler);
      textInput.addEventListener('blur', blurHandler);
    }
  }

  function focusEvent(component) {
    component._state.text = component._root.querySelector('.text__input').value;
    component.dispatchEvent(textInputFocusedEvent(component));
  }

  function blurEvent(component) {
    component._state.text = component._root.querySelector('.text__input').value;
    component.dispatchEvent(textInputBlurredEvent(component));
  }

  function textInputFocusedEvent(component) {
    return new CustomEvent('textInputFocused', {
      composed: true,
      cancelable: true,
      detail: { text: component._state.text }
    });
  }

  function textInputBlurredEvent(component) {
    return new CustomEvent('textInputBlurred', {
      composed: true,
      cancelable: true,
      detail: { text: component._state.text }
    });
  }

})(document, window);